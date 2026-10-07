import { useEffect, useRef, useState } from 'react'
import { Send, X, MessageSquare, AlertCircle } from 'lucide-react'
import { Avatar, Spinner } from './ui'

const QUICK_REPLIES = {
  rider: ["I'm at the pickup point", 'Please call when you arrive', 'Running 2 minutes late', 'Thank you!'],
  driver: ["I'm on my way", "I've arrived", 'Running a few minutes late', 'Thank you!'],
}

const time = (iso) => new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

/** Slide-over chat panel (bottom sheet on phones). `chat` comes from useTripChat. */
export function TripChatPanel({ open, onClose, chat, otherName }) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const listRef = useRef(null)
  const inputRef = useRef(null)
  const { messages, canSend, role, error, markSeen, send } = chat

  // While open, everything shown counts as read; keep the list scrolled to the newest message.
  useEffect(() => {
    if (!open) return
    markSeen()
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [open, messages.length, markSeen])

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const submit = async (value) => {
    const msg = value.trim()
    if (!msg || sending) return
    setSending(true)
    setSendError('')
    try {
      await send(msg)
      setText('')
    } catch (err) {
      setSendError(err.response?.data?.message || 'Message not sent. Try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-stretch sm:justify-end" role="dialog" aria-modal="true" aria-label={`Chat with ${otherName}`}>
      <div className="absolute inset-0 animate-fade-in bg-black/40" onClick={onClose} />
      <div className="relative flex h-[85vh] w-full flex-col rounded-t-2xl border border-line bg-surface shadow-overlay sm:h-full sm:max-w-md sm:rounded-none sm:border-y-0 sm:border-r-0">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <Avatar name={otherName} className="h-9 w-9 text-xs" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{otherName}</p>
            <p className="text-xs text-ink-subtle">Trip chat · messages stay in RideLink</p>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-sm" aria-label="Close chat">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto bg-canvas px-4 py-4" aria-live="polite">
          {error && (
            <div className="alert alert-danger"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>
          )}
          {messages.length === 0 && !error ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface text-ink-subtle">
                <MessageSquare className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <p className="text-sm font-medium text-ink">No messages yet</p>
              <p className="mt-1 max-w-[16rem] text-[13px] text-ink-muted">Send {otherName.split(' ')[0] || 'them'} a quick note about the pickup.</p>
            </div>
          ) : (
            messages.map(m => {
              const mine = m.senderRole === role
              return (
                <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${mine ? 'rounded-br-md bg-accent text-white' : 'rounded-bl-md border border-line bg-surface text-ink'}`}>
                    <p className="whitespace-pre-wrap break-words">{m.text}</p>
                    <p className={`mt-0.5 text-right text-[11px] ${mine ? 'text-white/75' : 'text-ink-subtle'}`}>{time(m.createdAt)}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-line bg-surface p-3">
          {canSend ? (
            <>
              <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
                {(QUICK_REPLIES[role] || []).map(q => (
                  <button key={q} type="button" disabled={sending} onClick={() => submit(q)}
                    className="shrink-0 rounded-full border border-line bg-surface-2 px-3 py-1.5 text-xs text-ink-muted hover:border-line-strong hover:text-ink">
                    {q}
                  </button>
                ))}
              </div>
              {sendError && <p className="mb-2 text-xs text-danger" role="alert">{sendError}</p>}
              <form onSubmit={e => { e.preventDefault(); submit(text) }} className="flex items-center gap-2">
                <label htmlFor="trip-chat-input" className="sr-only">Message</label>
                <input
                  id="trip-chat-input"
                  ref={inputRef}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  maxLength={500}
                  placeholder="Type a message…"
                  autoComplete="off"
                  className="input h-11 flex-1"
                />
                <button type="submit" disabled={sending || !text.trim()} className="btn btn-primary btn-icon h-11 w-11" aria-label="Send message">
                  {sending ? <Spinner /> : <Send className="h-4 w-4" />}
                </button>
              </form>
            </>
          ) : (
            <p className="py-2 text-center text-[13px] text-ink-muted">Messaging is closed — this trip is no longer active.</p>
          )}
        </div>
      </div>
    </div>
  )
}

/** Small red count shown on a Message button. */
export function UnreadBadge({ count }) {
  if (!count) return null
  return (
    <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[11px] font-semibold text-white tabular-nums" aria-label={`${count} unread`}>
      {count}
    </span>
  )
}
