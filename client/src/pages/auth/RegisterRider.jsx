import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Lock, AlertCircle } from 'lucide-react'
import AuthLayout from '../../components/AuthLayout'
import { Spinner } from '../../components/ui'
import GoogleButton from '../../components/GoogleButton'
import API from '../../api'

const iconClass = 'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle'

export default function RegisterRider() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match')
    }
    setLoading(true)
    setError('')
    try {
      await API.post('/auth/register', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: 'rider'
      })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Join RideLink as a rider today."
      footer={
        <div className="space-y-2">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="link">Sign In</Link>
          </p>
          <p>
            Want to drive instead?{' '}
            <Link to="/register/driver" className="link">Join as Driver</Link>
          </p>
        </div>
      }
    >
      <div className="mb-6 flex items-center gap-1.5" aria-hidden="true">
        <div className="h-1 flex-1 rounded-full bg-accent" />
        <div className="h-1 flex-1 rounded-full bg-surface-3" />
      </div>

      {error && (
        <div className="alert alert-danger mb-5" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="label">Full Name</label>
          <div className="relative">
            <User className={iconClass} strokeWidth={1.75} />
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="John Doe"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="input pl-10"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="label">Email Address</label>
          <div className="relative">
            <Mail className={iconClass} strokeWidth={1.75} />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="input pl-10"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="label">Phone Number</label>
          <div className="relative">
            <Phone className={iconClass} strokeWidth={1.75} />
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="08012345678"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="input pl-10"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="label">Password</label>
          <div className="relative">
            <Lock className={iconClass} strokeWidth={1.75} />
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="input pl-10"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="label">Confirm Password</label>
          <div className="relative">
            <Lock className={iconClass} strokeWidth={1.75} />
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              className="input pl-10"
              required
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
          {loading ? <><Spinner /> Creating Account...</> : 'Create Account'}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="eyebrow">Or</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <GoogleButton label="Sign up with Google" onError={setError} className="w-full" />
    </AuthLayout>
  )
}
