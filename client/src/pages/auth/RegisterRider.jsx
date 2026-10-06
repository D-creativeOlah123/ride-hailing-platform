import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ThemeToggle from '../../components/ThemeToggle'
import API from '../../api'

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
    <div className="min-h-screen bg-white dark:bg-navy-900 flex flex-col">
      <nav className="px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-white/5">
        <Link to="/" className="text-brand-blue font-bold text-xl">RideLink</Link>
        <ThemeToggle />
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-8 border border-gray-200 dark:border-white/5 shadow-xl">

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex-1 h-1 bg-brand-blue rounded-full"></div>
                <div className="flex-1 h-1 bg-gray-200 dark:bg-white/10 rounded-full"></div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create Your Account</h1>
              <p className="text-sm text-gray-500 dark:text-white/40">Join RideLink as a rider today.</p>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-white/40 uppercase tracking-wider mb-2 block">Full Name</label>
                <input
                  type="text" placeholder="John Doe"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white dark:bg-navy-700 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:border-brand-blue transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-white/40 uppercase tracking-wider mb-2 block">Email Address</label>
                <input
                  type="email" placeholder="john@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white dark:bg-navy-700 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:border-brand-blue transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-white/40 uppercase tracking-wider mb-2 block">Phone Number</label>
                <input
                  type="tel" placeholder="08012345678"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-white dark:bg-navy-700 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:border-brand-blue transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-white/40 uppercase tracking-wider mb-2 block">Password</label>
                <input
                  type="password" placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-white dark:bg-navy-700 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:border-brand-blue transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-white/40 uppercase tracking-wider mb-2 block">Confirm Password</label>
                <input
                  type="password" placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full bg-white dark:bg-navy-700 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:border-brand-blue transition-colors"
                  required
                />
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-brand-blue hover:bg-brand-blue-hover disabled:opacity-60 text-white py-3 rounded-xl font-medium transition-all mt-2">
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 dark:text-white/40 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-blue hover:underline font-medium">Sign In</Link>
            </p>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/5 text-center">
              <p className="text-sm text-gray-500 dark:text-white/40">
                Want to drive instead?{' '}
                <Link to="/register/driver" className="text-brand-blue hover:underline font-medium">Join as Driver</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}