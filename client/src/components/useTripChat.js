import { useCallback, useEffect, useState } from 'react'
import API from '../api'

const POLL_MS = 4000

/**
 * Polls a trip's chat and tracks unread messages (from the other person) since the chat was last opened.
 * Returns state plus helpers for the panel and the button badge.
 */
export function useTripChat(tripId, enabled) {
  const [messages, setMessages] = useState([])
  const [canSend, setCanSend] = useState(false)
  const [role, setRole] = useState(null)
  const [error, setError] = useState('')
  const seenKey = `chat-seen-${tripId}`
  const [seenCount, setSeenCount] = useState(() => {
    try { return Number(localStorage.getItem(seenKey)) || 0 } catch { return 0 }
  })

  const load = useCallback(() =>
    API.get(`/trips/${tripId}/messages`)
      .then(res => {
        setMessages(res.data.messages)
        setCanSend(res.data.canSend)
        setRole(res.data.role)
        setError('')
      })
      .catch(err => setError(err.response?.data?.message || 'Could not load messages'))
  , [tripId])

  useEffect(() => {
    if (!enabled) return
    load()
    const id = setInterval(load, POLL_MS)
    return () => clearInterval(id)
  }, [enabled, load])

  const fromOther = messages.filter(m => role && m.senderRole !== role).length
  const unread = Math.max(0, fromOther - seenCount)

  const markSeen = useCallback(() => {
    setSeenCount(fromOther)
    try { localStorage.setItem(seenKey, String(fromOther)) } catch { /* ignore */ }
  }, [fromOther, seenKey])

  const send = async (text) => {
    const res = await API.post(`/trips/${tripId}/messages`, { text })
    setMessages(m => [...m, res.data])
    return res.data
  }

  return { messages, canSend, role, error, unread, markSeen, send, reload: load }
}
