import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'
import AuthLayout from '../../components/AuthLayout'
import { Spinner } from '../../components/ui'
import API from '../../api'

export default function ResetPassword() {
  const { token } = useParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) return setError('Password must be at least 8 characters')
    if (password !== confirm) return setError('Passwords do not match')
    setLoading(true)
    try {
      await API.post(`/auth/reset-password/${token}`, { password })
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <AuthLayout title="Password updated">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success">
            <CheckCircle2 className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <p className="mt-5 text-sm text-ink-muted">Your password has been changed. You can now sign in with your new password.</p>
          <Link to="/login" className="btn btn-primary btn-lg mt-6 w-full">Sign in</Link>
        </div>
      </AuthLayout>
    )
  }

  const expired = /invalid or has expired/i.test(error)

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a password with at least 8 characters."
      footer={
        <Link to="/login" className="inline-flex items-center gap-1.5 font-medium text-ink-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      }
    >
      {error && (
        <div className="alert alert-danger mb-5" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {error}
            {expired && <> <Link to="/forgot-password" className="font-medium underline underline-offset-4">Request a new link</Link></>}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="password" className="label">New password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" strokeWidth={1.75} />
            <input
              id="password"
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input pl-10 pr-11"
              required
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-ink-subtle hover:bg-surface-2 hover:text-ink"
              aria-label={show ? 'Hide password' : 'Show password'}
            >
              {show ? <EyeOff className="h-4 w-4" strokeWidth={1.75} /> : <Eye className="h-4 w-4" strokeWidth={1.75} />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirm" className="label">Confirm new password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" strokeWidth={1.75} />
            <input
              id="confirm"
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Repeat your new password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="input pl-10"
              required
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
          {loading ? <><Spinner /> Updating…</> : 'Update password'}
        </button>
      </form>
    </AuthLayout>
  )
}
