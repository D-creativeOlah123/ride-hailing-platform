// Trip payments with Paystack (cards, bank transfer, USSD).
// Needs PAYSTACK_SECRET_KEY (sk_test_… for test mode). Without it, payment endpoints return 503.
const express = require('express')
const crypto = require('crypto')
const router = express.Router()
const Trip = require('../models/Trip')
const User = require('../models/User')
const { protect, authorize } = require('../middleware/auth')

// Overridable only so tests can point at a stand-in Paystack
const PAYSTACK = process.env.PAYSTACK_API_BASE || 'https://api.paystack.co'
const secret = () => process.env.PAYSTACK_SECRET_KEY

async function paystack(path, options = {}) {
    const res = await fetch(PAYSTACK + path, {
        ...options,
        headers: { Authorization: `Bearer ${secret()}`, 'Content-Type': 'application/json', ...(options.headers || {}) },
        signal: AbortSignal.timeout(15000),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok || body.status === false) {
        const err = new Error(body.message || `Paystack responded ${res.status}`)
        err.paystack = true
        throw err
    }
    return body.data
}

/**
 * Marks the trip paid if Paystack's transaction data really is a successful payment
 * of the full fare for this trip. Safe to call more than once.
 */
async function applyPayment(trip, data) {
    if (trip.payment?.status === 'paid') return { ok: true, already: true }
    const expectedKobo = Math.round((trip.fare || 0) * 100)
    const problems = []
    if (data.status !== 'success') problems.push(`status ${data.status}`)
    if (data.currency !== 'NGN') problems.push(`currency ${data.currency}`)
    if (Number(data.amount) !== expectedKobo) problems.push(`amount ${data.amount} != ${expectedKobo}`)
    if (String(data.metadata?.tripId) !== String(trip._id)) problems.push('trip mismatch')
    if (problems.length) return { ok: false, problems }

    trip.payment = {
        status: 'paid',
        method: data.channel || 'card',
        reference: data.reference,
        amount: Number(data.amount) / 100,
        paidAt: data.paid_at ? new Date(data.paid_at) : new Date(),
    }
    await trip.save()
    return { ok: true }
}

const paymentView = (trip) => ({
    tripId: trip._id,
    fare: trip.fare,
    status: trip.payment?.status || 'unpaid',
    method: trip.payment?.method,
    reference: trip.payment?.reference,
    amount: trip.payment?.amount,
    paidAt: trip.payment?.paidAt,
})

// Is online payment available? (lets the UI hide/disable the Pay button)
router.get('/config', (req, res) => {
    const key = secret() || ''
    res.json({ enabled: Boolean(key), mode: key.startsWith('sk_live_') ? 'live' : key ? 'test' : null })
})

// Start a payment for a completed trip (rider only)
router.post('/initialize', protect, authorize('rider'), async (req, res) => {
    try {
        if (!secret()) return res.status(503).json({ message: 'Online payment is not set up yet' })
        const trip = await Trip.findById(req.body.tripId)
        if (!trip) return res.status(404).json({ message: 'Trip not found' })
        if (trip.rider.toString() !== req.user.id) return res.status(403).json({ message: 'Not your trip' })
        if (trip.status !== 'completed') return res.status(400).json({ message: 'You can pay once the trip is completed' })
        if (trip.payment?.status === 'paid') return res.status(400).json({ message: 'This trip is already paid' })
        if (!trip.fare || trip.fare <= 0) return res.status(400).json({ message: 'This trip has no fare to pay' })

        const rider = await User.findById(req.user.id).select('email')
        const reference = `RL-${trip._id}-${Date.now()}`
        const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '')

        const data = await paystack('/transaction/initialize', {
            method: 'POST',
            body: JSON.stringify({
                email: rider.email,
                amount: Math.round(trip.fare * 100), // kobo
                currency: 'NGN',
                reference,
                callback_url: `${clientUrl}/rider/trip/${trip._id}`,
                metadata: {
                    tripId: String(trip._id),
                    riderId: req.user.id,
                    custom_fields: [{ display_name: 'Trip', variable_name: 'trip', value: `${trip.pickupLocation} to ${trip.destination}` }],
                },
            }),
        })

        trip.payment = { ...(trip.payment?.toObject?.() || {}), status: 'pending', reference }
        await trip.save()
        res.json({ accessCode: data.access_code, authorizationUrl: data.authorization_url, reference })
    } catch (err) {
        res.status(err.paystack ? 502 : 500).json({ message: err.paystack ? `Payment provider error: ${err.message}` : 'Server error', error: err.message })
    }
})

// Confirm a payment after the Paystack popup/redirect (rider of the trip only)
router.get('/verify/:reference', protect, async (req, res) => {
    try {
        if (!secret()) return res.status(503).json({ message: 'Online payment is not set up yet' })
        const { reference } = req.params
        const tripId = (reference.match(/^RL-([a-f0-9]{24})-\d+$/) || [])[1]
        if (!tripId) return res.status(400).json({ message: 'Invalid payment reference' })

        const trip = await Trip.findById(tripId)
        if (!trip) return res.status(404).json({ message: 'Trip not found' })
        const uid = req.user.id
        if (trip.rider.toString() !== uid && trip.driver?.toString() !== uid && !['ops_manager', 'super_admin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Not your trip' })
        }
        if (trip.payment?.status === 'paid') return res.json({ message: 'Payment confirmed', payment: paymentView(trip) })

        const data = await paystack(`/transaction/verify/${encodeURIComponent(reference)}`)
        const result = await applyPayment(trip, data)
        if (!result.ok) {
            if (data.status !== 'success' && trip.payment?.status === 'pending') {
                trip.payment.status = 'unpaid'
                await trip.save()
            }
            return res.status(400).json({ message: data.status === 'success' ? 'Payment could not be matched to this trip' : 'Payment was not completed', payment: paymentView(trip) })
        }
        res.json({ message: 'Payment confirmed', payment: paymentView(trip) })
    } catch (err) {
        res.status(err.paystack ? 502 : 500).json({ message: err.paystack ? `Payment provider error: ${err.message}` : 'Server error', error: err.message })
    }
})

// Payment status for a trip (rider, driver or admin)
router.get('/trip/:id', protect, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id)
        if (!trip) return res.status(404).json({ message: 'Trip not found' })
        const uid = req.user.id
        if (trip.rider.toString() !== uid && trip.driver?.toString() !== uid && !['ops_manager', 'super_admin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Not your trip' })
        }
        res.json(paymentView(trip))
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
})

// Paystack webhook: confirms payments even if the rider closes the page.
// Mounted with express.raw() in index.js so the signature can be checked on the exact bytes.
router.post('/webhook', async (req, res) => {
    try {
        if (!secret()) return res.sendStatus(503)
        const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.from('')
        const signature = req.get('x-paystack-signature') || ''
        const expected = crypto.createHmac('sha512', secret()).update(raw).digest('hex')
        if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
            return res.sendStatus(401)
        }
        const event = JSON.parse(raw.toString('utf8'))
        if (event.event === 'charge.success') {
            const tripId = event.data?.metadata?.tripId
            const trip = tripId && /^[a-f0-9]{24}$/.test(tripId) ? await Trip.findById(tripId) : null
            if (trip) {
                // Re-verify with Paystack rather than trusting the payload alone
                const data = await paystack(`/transaction/verify/${encodeURIComponent(event.data.reference)}`)
                await applyPayment(trip, data)
            }
        }
        res.sendStatus(200)
    } catch (err) {
        console.error('Paystack webhook error:', err.message)
        res.sendStatus(200) // acknowledge so Paystack doesn't retry forever; verify endpoint is the fallback
    }
})

module.exports = router
