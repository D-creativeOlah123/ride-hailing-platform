import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ThemeToggle from '../../components/ThemeToggle'
import API from '../../api'

export default function RegisterDriver() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    make: '', model: '', year: '', plateNumber: '', licenseNumber: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await API.post('/auth/register', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: 'driver',
        vehicle: {
          make: form.make,
          model: form.model,
          year: form.year,
          plateNumber: form.plateNumber,
          licenseNumber: form.licenseNumber
        }
      })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-white dark:bg-navy-700 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:border-brand-blue transition-colors"
  const labelClass = "text-xs font-medium text-gray-500 dark:text-white/40 uppercase tracking-wider mb-2 block"

  return (
    <div className="min-h-screen bg-white dark:bg-navy-900 flex flex-col">
      <nav className="px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-white/5">
        <Link to="/" className="text-brand-blue font-bold text-xl">RideLink</Link>
        <ThemeToggle />
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-8 border border-gray-200 dark:border-white/5 shadow-xl">

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-brand-blue' : 'bg-gray-200 dark:bg-white/10'}`}></div>
                <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-brand-blue' : 'bg-gray-200 dark:bg-white/10'}`}></div>
                <div className={`flex-1 h-1 rounded-full ${step >= 3 ? 'bg-brand-blue' : 'bg-gray-200 dark:bg-white/10'}`}></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-white/40">Step {step} of 3</p>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">Driver Partner Registration</h1>
              <p className="text-sm text-gray-500 dark:text-white/40">Join our network of professional executive chauffeurs.</p>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">{error}</div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Full Name</label>
                    <input type="text" placeholder="Alexander Harrison" value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Email Address</label>
                    <input type="email" placeholder="a.harrison@executive.com" value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <input type="tel" placeholder="08012345678" value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })} className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Password</label>
                    <input type="password" placeholder="••••••••" value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })} className={inputClass} required />
                  </div>
                </div>
                <button onClick={() => setStep(2)}
                  className="w-full bg-brand-blue hover:bg-brand-blue-hover text-white py-3 rounded-xl font-medium transition-all mt-4">
                  Continue to Step 2
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Vehicle Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Vehicle Make</label>
                    <input type="text" placeholder="e.g. Mercedes-Benz" value={form.make}
                      onChange={e => setForm({ ...form, make: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Vehicle Model</label>
                    <input type="text" placeholder="e.g. S-Class" value={form.model}
                      onChange={e => setForm({ ...form, model: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Manufacturing Year</label>
                    <select value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} className={inputClass}>
                      <option value="">Select Year</option>
                      {[2024,2023,2022,2021,2020,2019,2018].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>License Plate</label>
                    <input type="text" placeholder="ABC-1234" value={form.plateNumber}
                      onChange={e => setForm({ ...form, plateNumber: e.target.value })} className={inputClass} />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setStep(1)}
                    className="flex-1 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 py-3 rounded-xl font-medium transition-all hover:border-brand-blue">
                    Back to Step 1
                  </button>
                  <button onClick={() => setStep(3)}
                    className="flex-1 bg-brand-blue hover:bg-brand-blue-hover text-white py-3 rounded-xl font-medium transition-all">
                    Continue to Step 3
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">License & Documents</h2>
                <div>
                  <label className={labelClass}>Driver's License Number</label>
                  <input type="text" placeholder="DL-88239401" value={form.licenseNumber}
                    onChange={e => setForm({ ...form, licenseNumber: e.target.value })} className={inputClass} />
                </div>
                <div className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl p-8 text-center hover:border-brand-blue transition-colors cursor-pointer">
                  <div className="text-3xl mb-2">☁️</div>
                  <p className="text-sm text-gray-500 dark:text-white/40">Click to upload license photo</p>
                  <p className="text-xs text-gray-400 dark:text-white/20 mt-1">SVG, PNG, JPG (max. 5MB)</p>
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="mt-1" required />
                  <span className="text-xs text-gray-500 dark:text-white/40">
                    I certify that the information provided is accurate and I understand that fraudulent claims may result in account suspension.
                  </span>
                </label>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setStep(2)}
                    className="flex-1 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 py-3 rounded-xl font-medium transition-all hover:border-brand-blue">
                    Back to Step 2
                  </button>
                  <button onClick={handleSubmit} disabled={loading}
                    className="flex-1 bg-brand-blue hover:bg-brand-blue-hover disabled:opacity-60 text-white py-3 rounded-xl font-medium transition-all">
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </div>
            )}

            <p className="text-center text-sm text-gray-500 dark:text-white/40 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-blue hover:underline font-medium">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}