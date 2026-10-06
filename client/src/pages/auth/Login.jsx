import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../../components/ThemeToggle'
import API from '../../api'

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
    <div className="min-h-screen bg-white dark:bg-navy-900 flex flex-col">
      <nav className="px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-white/5">
        <Link to="/" className="text-brand-blue font-bold text-xl">RideLink</Link>
        <div className="flex items-center gap-4">
          <a href="#" className="text-sm text-gray-500 dark:text-white/50 hover:text-brand-blue">How it works</a>
          <a href="#" className="text-sm text-gray-500 dark:text-white/50 hover:text-brand-blue">Support</a>
          <ThemeToggle />
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-8 border border-gray-200 dark:border-white/5 shadow-xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h1>
              <p className="text-sm text-gray-500 dark:text-white/40">Precision ride management for the modern executive.</p>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-white/40 uppercase tracking-wider mb-2 block">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">✉</span>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-white dark:bg-navy-700 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:border-brand-blue transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-white/40 uppercase tracking-wider mb-2 block">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-white dark:bg-navy-700 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 pl-10 pr-10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:border-brand-blue transition-colors"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-blue transition-colors text-sm">
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/40 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 dark:border-white/20 bg-transparent" />
                  Remember me
                </label>
                <a href="#" className="text-sm text-brand-blue hover:underline">Forgot password?</a>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-brand-blue hover:bg-brand-blue-hover disabled:opacity-60 text-white py-3 rounded-xl font-medium transition-all">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200 dark:bg-white/10"></div>
              <span className="text-xs text-gray-400 dark:text-white/30">OR CONTINUE WITH</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-white/10"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 bg-white dark:bg-navy-700 border border-gray-200 dark:border-white/10 rounded-xl py-3 text-sm text-gray-700 dark:text-white/70 hover:border-brand-blue transition-all">
                <span>G</span> Google
              </button>
              <button className="flex items-center justify-center gap-2 bg-white dark:bg-navy-700 border border-gray-200 dark:border-white/10 rounded-xl py-3 text-sm text-gray-700 dark:text-white/70 hover:border-brand-blue transition-all">
                <span>🍎</span> Apple
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 dark:text-white/40 mt-6">
              Don't have an account?{' '}
              <Link to="/register/rider" className="text-brand-blue hover:underline font-medium">Request Access</Link>
            </p>
          </div>

          <div className="flex justify-center gap-6 mt-6 text-xs text-gray-400 dark:text-white/20">
            <a href="#" className="hover:text-brand-blue">Privacy Policy</a>
            <a href="#" className="hover:text-brand-blue">Terms of Service</a>
          </div>
        </div>
      </div>

      <footer className="px-6 py-4 border-t border-gray-200 dark:border-white/5 flex items-center justify-between">
        <span className="text-brand-blue font-bold">RideLink</span>
        <p className="text-xs text-gray-400 dark:text-white/20">© 2024 RideLink. Precision in Motion.</p>
        <div className="flex gap-4 text-xs text-gray-400 dark:text-white/20">
          <a href="#" className="hover:text-brand-blue">Support</a>
          <a href="#" className="hover:text-brand-blue">Safety</a>
          <a href="#" className="hover:text-brand-blue">Legal</a>
          <a href="#" className="hover:text-brand-blue">Privacy</a>
        </div>
      </footer>
    </div>
  )
}