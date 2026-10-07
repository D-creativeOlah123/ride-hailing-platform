// Paystack trip payments: script loader, config, verification and the usePaystackPayment hook.
// The server does all the money work (initialize + verify); this only drives Paystack's popup.
import { useCallback, useEffect, useRef, useState } from 'react'
import API from '../../api'

const SCRIPT_SRC = 'https://js.paystack.co/v2/inline.js'
const SCRIPT_TIMEOUT_MS = 15000

let scriptPromise = null

/** Loads Paystack's popup script once. Resolves with window.PaystackPop, rejects if it can't load. */
export function loadPaystack() {
  if (typeof window === 'undefined') return Promise.reject(new Error('No browser window'))
  if (window.PaystackPop) return Promise.resolve(window.PaystackPop)
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      let script = document.querySelector(`script[src="${SCRIPT_SRC}"]`)
      if (!script) {
        script = document.createElement('script')
        script.src = SCRIPT_SRC
        script.async = true
        document.head.appendChild(script)
      }
      const fail = () => {
        clearTimeout(timer)
        script.remove()
        scriptPromise = null // let the next attempt try again
        reject(new Error('Paystack could not be loaded'))
      }
      const timer = setTimeout(fail, SCRIPT_TIMEOUT_MS)
      script.addEventListener('load', () => {
        clearTimeout(timer)
        if (window.PaystackPop) resolve(window.PaystackPop)
        else fail()
      })
      script.addEventListener('error', fail)
    })
  }
  return scriptPromise
}

let configPromise = null

/** GET /payments/config, shared by every pay button on the page. */
export function fetchPaymentConfig() {
  if (!configPromise) {
    configPromise = API.get('/payments/config')
      .then(res => res.data || { enabled: false, mode: null })
      .catch(err => {
        configPromise = null
        throw err
      })
  }
  return configPromise
}

/**
 * Confirms a payment with the server. Never rejects.
 * Resolves { ok, message, payment?, notCompleted? }.
 */
export function verifyPayment(reference) {
  return API.get(`/payments/verify/${encodeURIComponent(reference)}`)
    .then(res => ({ ok: true, message: res.data?.message || 'Payment confirmed', payment: res.data?.payment }))
    .catch(err => {
      const status = err.response?.status
      const message = err.response?.data?.message
      if (status === 400 && (!message || /not completed/i.test(message))) {
        return { ok: false, notCompleted: true, message: 'Payment not completed. You can try again whenever you’re ready.' }
      }
      return { ok: false, message: message || 'We couldn’t confirm your payment. Check your connection and try again.' }
    })
}

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

const METHOD_LABELS = {
  card: 'Card',
  bank: 'Bank account',
  bank_transfer: 'Bank transfer',
  ussd: 'USSD',
  qr: 'QR code',
  mobile_money: 'Mobile money',
  apple_pay: 'Apple Pay',
  eft: 'EFT',
}

/** "Card", "Bank transfer", "USSD"… from Paystack's channel name. */
export function paymentMethodLabel(method) {
  if (!method) return 'Paystack'
  return METHOD_LABELS[method] || method.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())
}

const RIDE_TYPE_LABELS = { economy: 'Economy', comfort: 'Comfort', xl: 'XL' }

/** "Economy" / "Comfort" / "XL", or '' if the trip has no ride type. */
export const rideTypeLabel = (type) => RIDE_TYPE_LABELS[type] || ''

/** "12.4 km", or '' if unknown. */
export function formatDistance(km) {
  const n = Number(km)
  if (!n || n <= 0) return ''
  return `${Math.round(n * 10) / 10} km`
}

/** "25 min" / "1 h 10 min", or '' if unknown. */
export function formatDuration(minutes) {
  const n = Math.round(Number(minutes))
  if (!n || n <= 0) return ''
  if (n < 60) return `${n} min`
  const h = Math.floor(n / 60), m = n % 60
  return m ? `${h} h ${m} min` : `${h} h`
}

/** "Economy · 12.4 km" from whatever the trip has. */
export const tripMetaLine = (trip, { duration = false } = {}) =>
  [rideTypeLabel(trip?.rideType), formatDistance(trip?.distanceKm), duration && formatDuration(trip?.duration) && `~${formatDuration(trip.duration)}`]
    .filter(Boolean)
    .join(' · ')

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Drives a Paystack payment for a completed trip.
 * phase: idle | starting | paying | verifying | redirecting
 * notice: { tone: 'success' | 'warning' | 'danger', text } | null
 */
export function usePaystackPayment({ tripId, onPaid }) {
  const [config, setConfig] = useState(null)
  const [configLoading, setConfigLoading] = useState(true)
  const [phase, setPhase] = useState('idle')
  const [notice, setNotice] = useState(null)
  const onPaidRef = useRef(onPaid)

  useEffect(() => {
    onPaidRef.current = onPaid
  })

  // Promise chain so state is only set in async callbacks.
  const loadConfig = useCallback(() =>
    fetchPaymentConfig()
      .then(data => setConfig(data))
      // Couldn't check: let the rider try; the server will explain if payments are off.
      .catch(() => setConfig({ enabled: true, mode: null }))
      .finally(() => setConfigLoading(false)),
  [])

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  const confirm = useCallback((reference) => {
    setPhase('verifying')
    return verifyPayment(reference).then(result => {
      setPhase('idle')
      if (result.ok) {
        setNotice({ tone: 'success', text: 'Payment confirmed. Thank you!' })
        onPaidRef.current?.(result.payment)
      } else {
        setNotice({ tone: result.notCompleted ? 'warning' : 'danger', text: result.message })
      }
      return result
    })
  }, [])

  const pay = useCallback(() => {
    if (!tripId) return
    setPhase('starting')
    setNotice(null)
    API.post('/payments/initialize', { tripId })
      .then(res => {
        const { accessCode, authorizationUrl, reference } = res.data || {}
        return loadPaystack()
          .then(PaystackPop => {
            setPhase('paying')
            let settled = false
            // Whatever happens in the popup, ask the server what really happened.
            const done = () => {
              if (settled) return
              settled = true
              confirm(reference)
            }
            const popup = new PaystackPop()
            popup.resumeTransaction(accessCode, { onSuccess: done, onCancel: done, onError: done })
          })
          .catch(() => {
            // Script blocked or offline: use Paystack's hosted page, which redirects back to the trip.
            if (authorizationUrl) {
              setPhase('redirecting')
              window.location.href = authorizationUrl
            } else {
              setPhase('idle')
              setNotice({ tone: 'danger', text: 'We couldn’t open Paystack. Check your connection and try again.' })
            }
          })
      })
      .catch(err => {
        setPhase('idle')
        setNotice({
          tone: 'danger',
          text: err.response?.data?.message || 'We couldn’t start the payment. Check your connection and try again.',
        })
      })
  }, [tripId, confirm])

  return { config, configLoading, phase, notice, pay }
}
