import { CreditCard, Lock, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { Spinner, Skeleton } from '../ui'
import { naira } from '../../utils/tripStats'
import { usePaystackPayment } from './paystack'

const PHASE_LABEL = {
  starting: 'Starting payment…',
  paying: 'Finish paying in the Paystack window…',
  verifying: 'Confirming payment…',
  redirecting: 'Opening Paystack…',
}

const NOTICE_CLASS = {
  success: 'alert-success',
  danger: 'alert-danger',
  warning: 'border-warning/20 bg-warning/[0.07] text-warning',
}

const NOTICE_ICON = { success: CheckCircle2, danger: AlertCircle, warning: Info }

/**
 * Pay for a completed trip through Paystack (card, bank transfer, USSD).
 * Calls onPaid(payment) once the server has confirmed the payment.
 */
export default function PayButton({ trip, onPaid }) {
  const { config, configLoading, phase, notice, pay } = usePaystackPayment({ tripId: trip?._id, onPaid })
  const busy = phase !== 'idle'
  const amount = naira(trip?.fare)

  if (configLoading) {
    return <Skeleton className="h-12" />
  }

  if (!config?.enabled) {
    return (
      <div className="well flex items-start gap-3 p-4">
        <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-ink-subtle" strokeWidth={1.75} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">Card payment isn’t switched on yet</p>
          <p className="mt-0.5 text-xs text-ink-muted">Your fare of {amount} is saved on this trip. You’ll be able to pay here once online payment is available.</p>
        </div>
      </div>
    )
  }

  const NoticeIcon = notice ? NOTICE_ICON[notice.tone] : null

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={pay}
        disabled={busy}
        aria-busy={busy}
        className="btn btn-primary btn-lg w-full"
      >
        {busy ? (
          <>
            <Spinner />
            <span className="truncate">{PHASE_LABEL[phase]}</span>
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" strokeWidth={1.75} />
            Pay {amount}
          </>
        )}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-ink-subtle">
        <Lock className="h-3 w-3 shrink-0" strokeWidth={2} />
        Card, bank transfer or USSD, secured by Paystack
      </p>

      {config.mode === 'test' && (
        <p className="rounded-lg border border-dashed border-warning/40 bg-warning/[0.06] px-3 py-2 text-xs leading-relaxed text-ink-muted">
          <span className="font-semibold text-warning">Test mode</span> — use Paystack test card{' '}
          <span className="whitespace-nowrap font-mono text-ink tabular-nums">4084 0840 8408 4081</span>, any future expiry, CVV{' '}
          <span className="font-mono text-ink tabular-nums">408</span>
        </p>
      )}

      {notice && (
        <div className={`alert ${NOTICE_CLASS[notice.tone]} animate-fade-in`} role="status" aria-live="polite">
          <NoticeIcon className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span>{notice.text}</span>
        </div>
      )}
    </div>
  )
}
