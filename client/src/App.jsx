import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import LandingPage from './pages/LandingPage'
import Login from './pages/auth/Login'
import RegisterRider from './pages/auth/RegisterRider'
import RegisterDriver from './pages/auth/RegisterDriver'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import { Privacy, Terms } from './pages/Legal'

import RiderDashboard from './pages/rider/Dashboard'
import RiderActivity from './pages/rider/Activity'
import RiderDisputes from './pages/rider/Disputes'
import ActiveTrip from './pages/rider/ActiveTrip'
import RiderAnalytics from './pages/rider/Analytics'
import RiderSettings from './pages/rider/Settings'

import DriverDashboard from './pages/driver/Dashboard'
import DriverActivity from './pages/driver/Activity'
import DriverDisputes from './pages/driver/Disputes'
import DriverActiveTrip from './pages/driver/ActiveTrip'
import DriverAnalytics from './pages/driver/Analytics'
import DriverSettings from './pages/driver/Settings'

import AdminDashboard from './pages/admin/Dashboard'
import AdminDisputes from './pages/admin/Disputes'
import AdminDrivers from './pages/admin/Drivers'

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

    
    </BrowserRouter>
  )
}