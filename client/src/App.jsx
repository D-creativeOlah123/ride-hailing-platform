import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// The landing page ships in the main bundle; every other page is loaded on demand.
import LandingPage from './pages/LandingPage'

const Login = lazy(() => import('./pages/auth/Login'))
const RegisterRider = lazy(() => import('./pages/auth/RegisterRider'))
const RegisterDriver = lazy(() => import('./pages/auth/RegisterDriver'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'))
const Privacy = lazy(() => import('./pages/Legal').then(m => ({ default: m.Privacy })))
const Terms = lazy(() => import('./pages/Legal').then(m => ({ default: m.Terms })))
const RiderDashboard = lazy(() => import('./pages/rider/Dashboard'))
const RiderActivity = lazy(() => import('./pages/rider/Activity'))
const RiderDisputes = lazy(() => import('./pages/rider/Disputes'))
const ActiveTrip = lazy(() => import('./pages/rider/ActiveTrip'))
const RiderAnalytics = lazy(() => import('./pages/rider/Analytics'))
const RiderSettings = lazy(() => import('./pages/rider/Settings'))
const DriverDashboard = lazy(() => import('./pages/driver/Dashboard'))
const DriverActivity = lazy(() => import('./pages/driver/Activity'))
const DriverDisputes = lazy(() => import('./pages/driver/Disputes'))
const DriverActiveTrip = lazy(() => import('./pages/driver/ActiveTrip'))
const DriverAnalytics = lazy(() => import('./pages/driver/Analytics'))
const DriverSettings = lazy(() => import('./pages/driver/Settings'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminDisputes = lazy(() => import('./pages/admin/Disputes'))
const AdminDrivers = lazy(() => import('./pages/admin/Drivers'))
const AdminActivity = lazy(() => import('./pages/admin/Activity'))
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics'))

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas" role="status" aria-label="Loading">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    </div>
  )
}

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/rider" element={<RegisterRider />} />
        <Route path="/register/driver" element={<RegisterDriver />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        <Route path="/rider/dashboard" element={<ProtectedRoute roles={['rider']}><RiderDashboard /></ProtectedRoute>} />
        <Route path="/rider/activity" element={<ProtectedRoute roles={['rider']}><RiderActivity /></ProtectedRoute>} />
        <Route path="/rider/disputes" element={<ProtectedRoute roles={['rider']}><RiderDisputes /></ProtectedRoute>} />
        <Route path="/rider/trip/:id" element={<ProtectedRoute roles={['rider']}><ActiveTrip /></ProtectedRoute>} />
        <Route path="/rider/analytics" element={<ProtectedRoute roles={['rider']}><RiderAnalytics /></ProtectedRoute>} />
        <Route path="/rider/settings" element={<ProtectedRoute roles={['rider']}><RiderSettings /></ProtectedRoute>} />

        <Route path="/driver/dashboard" element={<ProtectedRoute roles={['driver']}><DriverDashboard /></ProtectedRoute>} />
        <Route path="/driver/activity" element={<ProtectedRoute roles={['driver']}><DriverActivity /></ProtectedRoute>} />
        <Route path="/driver/disputes" element={<ProtectedRoute roles={['driver']}><DriverDisputes /></ProtectedRoute>} />
        <Route path="/driver/trip/:id" element={<ProtectedRoute roles={['driver']}><DriverActiveTrip /></ProtectedRoute>} />
        <Route path="/driver/analytics" element={<ProtectedRoute roles={['driver']}><DriverAnalytics /></ProtectedRoute>} />
        <Route path="/driver/settings" element={<ProtectedRoute roles={['driver']}><DriverSettings /></ProtectedRoute>} />

        <Route path="/admin/dashboard" element={<ProtectedRoute roles={['ops_manager', 'super_admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/disputes" element={<ProtectedRoute roles={['ops_manager', 'super_admin']}><AdminDisputes /></ProtectedRoute>} />
        <Route path="/admin/drivers" element={<ProtectedRoute roles={['ops_manager', 'super_admin']}><AdminDrivers /></ProtectedRoute>} />
        <Route path="/admin/activity" element={<ProtectedRoute roles={['ops_manager', 'super_admin']}><AdminActivity /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute roles={['ops_manager', 'super_admin']}><AdminAnalytics /></ProtectedRoute>} />
        {/* The settings page is role-agnostic, so admins share it */}
        <Route path="/admin/settings" element={<ProtectedRoute roles={['ops_manager', 'super_admin']}><RiderSettings /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  )
}