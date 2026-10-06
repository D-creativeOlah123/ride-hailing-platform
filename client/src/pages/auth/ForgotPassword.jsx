import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, AlertCircle, MailCheck, ArrowLeft } from 'lucide-react'
import AuthLayout from '../../components/AuthLayout'
import { Spinner } from '../../components/ui'
import API from '../../api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await API.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const backToLogin = (
    <Link to="/login" className="inline-flex items-center gap-1.5 font-medium text-ink-muted hover:text-ink">
      <ArrowLeft className="h-4 w-4" /> Back to sign in
    </Link>
  )

  if (sent) {
    return (
      <AuthLayout title="Check your email" footer={backToLogin}>
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent-text">
            <MailCheck className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <p className="mt-5 text-sm leading-relaxed text-ink-muted">
            If an account exists for <span className="font-medium text-ink">{email}</span>, we sent a link to reset your password.
            The link expires in 1 hour.
          </p>
          <p className="mt-4 text-[13px] text-ink-subtle">
            Didn't get it? Check your spam folder, or{' '}
            <button type="button" onClick={() => setSent(false)} className="link">try again</button>.
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a link to reset it."
      footer={backToLogin}
    >
      {error && (
        <div className="alert alert-danger mb-5" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="label">Email address</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" strokeWidth={1.75} />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input pl-10"
              required
              autoFocus
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
          {loading ? <><Spinner /> Sending link…</> : 'Send reset link'}
        </button>
      </form>
    </AuthLayout>
  )
}
