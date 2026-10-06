import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from '../../components/AuthLayout'
import { Spinner } from '../../components/ui'
import GoogleButton from '../../components/GoogleButton'
import API from '../../api'

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M16.37 12.6c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.77-3.32-1.8-1.41-.14-2.76.83-3.48.83-.72 0-1.82-.81-3-.79a4.44 4.44 0 0 0-3.75 2.28c-1.6 2.78-.41 6.89 1.15 9.14.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.77.74 2.98.72 1.23-.02 2.01-1.12 2.76-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.4-.92-2.42-3.66zM14.1 5.86c.63-.77 1.06-1.83.94-2.89-.91.04-2.01.61-2.66 1.37-.58.67-1.09 1.75-.96 2.79 1.02.08 2.05-.52 2.68-1.27z" />
    </svg>
  )
}

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await API.post('/auth/login', form)
      login(res.data.user, res.data.token)
      const role = res.data.user.role
      if (role === 'rider') navigate('/rider/dashboard')
      else if (role === 'driver') navigate('/driver/dashboard')
      else navigate('/admin/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Precision ride management for the modern executive."
      footer={
        <>
          Don't have an account?{' '}
          <Link to="/register/rider" className="link">Request Access</Link>
        </>
      }
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
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="input pl-10"
              required
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-[13px] font-medium text-ink">Password</label>
            <Link to="/forgot-password" className="text-[13px] font-medium text-accent-text hover:underline underline-offset-4">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" strokeWidth={1.75} />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="input pl-10 pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-ink-subtle hover:bg-surface-2 hover:text-ink"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.75} /> : <Eye className="h-4 w-4" strokeWidth={1.75} />}
            </button>
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-muted">
          <input type="checkbox" className="h-4 w-4 rounded border-line-strong accent-[rgb(var(--accent))]" />
          Remember me
        </label>

        <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
          {loading ? <><Spinner /> Signing in…</> : 'Sign In'}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="eyebrow">Or continue with</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <GoogleButton onError={setError} />
        <button type="button" className="btn btn-secondary">
          <AppleIcon /> Apple
        </button>
      </div>
    </AuthLayout>
  )
}
