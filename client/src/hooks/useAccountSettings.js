import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import API from '../api'

const EMPTY_PASSWORDS = { currentPassword: '', newPassword: '', confirmPassword: '' }

/**
 * Shared state and actions for the rider/admin and driver Settings pages:
 * loads GET /auth/me, saves PATCH /auth/me and POST /auth/change-password.
 */
export default function useAccountSettings() {
  const { user, token, login } = useAuth()

  // Account as last returned by the server (falls back to the stored user until /me answers).
  const [account, setAccount] = useState(user)
  const [profile, setProfile] = useState(() => ({ name: user?.name || '', phone: user?.phone || '' }))
  const [profileLoading, setProfileLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState('')

  const [passwords, setPasswords] = useState(EMPTY_PASSWORDS)
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const [success, setSuccess] = useState('')

  const fetchAccount = useCallback(() =>
    API.get('/auth/me')
      .then(res => {
        const me = res.data.user
        setAccount(me)
        setProfile({ name: me.name || '', phone: me.phone || '' })
      })
      .catch(err => setProfileError(err.response?.data?.message || 'Could not load your profile'))
      .finally(() => setProfileLoading(false)), [])

  useEffect(() => {
    fetchAccount()
  }, [fetchAccount])

  // Success alert hides itself after a few seconds.
  useEffect(() => {
    if (!success) return undefined
    const timer = setTimeout(() => setSuccess(''), 4000)
    return () => clearTimeout(timer)
  }, [success])

  const saveProfile = async (e) => {
    e?.preventDefault()
    setProfileError('')
    setSuccess('')
    setSavingProfile(true)
    try {
      const res = await API.patch('/auth/me', { name: profile.name, phone: profile.phone })
      const updated = res.data.user
      setAccount(updated)
      setProfile({ name: updated.name || '', phone: updated.phone || '' })
      login(updated, token)
      setSuccess(res.data.message ? `${res.data.message}.` : 'Changes saved successfully!')
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Could not save your changes')
    } finally {
      setSavingProfile(false)
    }
  }

  const changePassword = async (e) => {
    e?.preventDefault()
    setPasswordError('')
    setSuccess('')
    const { currentPassword, newPassword, confirmPassword } = passwords
    if (!currentPassword) return setPasswordError('Enter your current password')
    if (newPassword.length < 8) return setPasswordError('New password must be at least 8 characters')
    if (newPassword !== confirmPassword) return setPasswordError('New passwords do not match')

    setSavingPassword(true)
    try {
      const res = await API.post('/auth/change-password', { currentPassword, newPassword })
      setPasswords(EMPTY_PASSWORDS)
      setSuccess(res.data.message ? `${res.data.message}.` : 'Password updated.')
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Could not update your password')
    } finally {
      setSavingPassword(false)
    }
  }

  return {
    account,
    profile, setProfile, profileLoading, savingProfile, profileError, saveProfile,
    passwords, setPasswords, savingPassword, passwordError, changePassword,
    success,
  }
}
