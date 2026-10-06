import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle, ArrowLeft, ArrowRight, ChevronDown, UploadCloud, UserRound, CarFront, IdCard,
} from 'lucide-react'
import AuthLayout from '../../components/AuthLayout'
import { Spinner } from '../../components/ui'
import API from '../../api'

const STEPS = [1, 2, 3]

function StepHeading({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-text">
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <h2 className="text-[15px] font-semibold text-ink">{children}</h2>
    </div>
  )
}

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

  const inputClass = 'input'
  const labelClass = 'label'

  return (
    <AuthLayout
      width="lg"
      title="Driver Partner Registration"
      subtitle="Join our network of professional executive chauffeurs."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="link">Sign In</Link>
        </>
      }
    >
      {/* Progress */}
      <div className="mb-6">
        <div className="mb-2.5 flex items-center gap-1.5" aria-hidden="true">
          {STEPS.map(n => (
            <div
              key={n}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${step >= n ? 'bg-accent' : 'bg-surface-3'}`}
            />
          ))}
        </div>
        <p className="eyebrow tabular-nums">Step {step} of 3</p>
      </div>

      {error && (
        <div className="alert alert-danger mb-5" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <StepHeading icon={UserRound}>Personal Information</StepHeading>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
            <div className="min-w-0">
              <label htmlFor="name" className={labelClass}>Full Name</label>
              <input id="name" type="text" autoComplete="name" placeholder="Alexander Harrison" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} required />
            </div>
            <div className="min-w-0">
              <label htmlFor="email" className={labelClass}>Email Address</label>
              <input id="email" type="email" autoComplete="email" placeholder="a.harrison@executive.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass} required />
            </div>
            <div className="min-w-0">
              <label htmlFor="phone" className={labelClass}>Phone Number</label>
              <input id="phone" type="tel" autoComplete="tel" placeholder="08012345678" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })} className={inputClass} required />
            </div>
            <div className="min-w-0">
              <label htmlFor="password" className={labelClass}>Password</label>
              <input id="password" type="password" autoComplete="new-password" placeholder="••••••••" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} className={inputClass} required />
            </div>
          </div>
          <div className="pt-1">
            <button onClick={() => setStep(2)} className="btn btn-primary btn-lg w-full">
              Continue to Step 2 <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <StepHeading icon={CarFront}>Vehicle Details</StepHeading>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
            <div className="min-w-0">
              <label htmlFor="make" className={labelClass}>Vehicle Make</label>
              <input id="make" type="text" placeholder="e.g. Mercedes-Benz" value={form.make}
                onChange={e => setForm({ ...form, make: e.target.value })} className={inputClass} />
            </div>
            <div className="min-w-0">
              <label htmlFor="model" className={labelClass}>Vehicle Model</label>
              <input id="model" type="text" placeholder="e.g. S-Class" value={form.model}
                onChange={e => setForm({ ...form, model: e.target.value })} className={inputClass} />
            </div>
            <div className="min-w-0">
              <label htmlFor="year" className={labelClass}>Manufacturing Year</label>
              <div className="relative">
                <select id="year" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} className={inputClass}>
                  <option value="">Select Year</option>
                  {[2024,2023,2022,2021,2020,2019,2018].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" strokeWidth={1.75} />
              </div>
            </div>
            <div className="min-w-0">
              <label htmlFor="plateNumber" className={labelClass}>License Plate</label>
              <input id="plateNumber" type="text" placeholder="ABC-1234" value={form.plateNumber}
                onChange={e => setForm({ ...form, plateNumber: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">
            <button onClick={() => setStep(1)} className="btn btn-secondary btn-lg w-full sm:flex-1">
              <ArrowLeft className="h-4 w-4" /> Back to Step 1
            </button>
            <button onClick={() => setStep(3)} className="btn btn-primary btn-lg w-full sm:flex-1">
              Continue to Step 3 <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <StepHeading icon={IdCard}>License & Documents</StepHeading>
          <div>
            <label htmlFor="licenseNumber" className={labelClass}>Driver's License Number</label>
            <input id="licenseNumber" type="text" placeholder="DL-88239401" value={form.licenseNumber}
              onChange={e => setForm({ ...form, licenseNumber: e.target.value })} className={inputClass} />
          </div>
          <div className="group flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-line-strong bg-surface-2/50 px-6 py-8 text-center transition-colors hover:border-accent hover:bg-accent/[0.04]">
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-surface text-ink-muted shadow-xs transition-colors group-hover:text-accent-text">
              <UploadCloud className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <p className="text-sm font-medium text-ink">Click to upload license photo</p>
            <p className="mt-1 text-xs text-ink-subtle">SVG, PNG, JPG (max. 5MB)</p>
          </div>
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 rounded border-line-strong accent-[rgb(var(--accent))]" required />
            <span className="text-[13px] leading-relaxed text-ink-muted">
              I certify that the information provided is accurate and I understand that fraudulent claims may result in account suspension.
            </span>
          </label>
          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">
            <button onClick={() => setStep(2)} className="btn btn-secondary btn-lg w-full sm:flex-1">
              <ArrowLeft className="h-4 w-4" /> Back to Step 2
            </button>
            <button onClick={handleSubmit} disabled={loading} className="btn btn-primary btn-lg w-full sm:flex-1">
              {loading ? <><Spinner /> Submitting...</> : 'Submit Application'}
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  )
}
