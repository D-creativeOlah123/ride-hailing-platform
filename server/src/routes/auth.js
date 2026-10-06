const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { OAuth2Client } = require('google-auth-library')
const User = require('../models/User')
const { protect, authorize } = require('../middleware/auth')
const { sendPasswordResetEmail, isConfigured: isMailConfigured } = require('../utils/mailer')

const googleClient = new OAuth2Client()

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex')

// Case-insensitive email lookup
const findByEmail = (email) => User.findOne({ email }).collation({ locale: 'en', strength: 2 })

const sessionFor = (user) => ({
    token: jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' }),
    user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved
    }
})

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, role, vehicle } = req.body

        // Block admin registration from public API
        if (role === 'ops_manager' || role === 'super_admin') {
            return res.status(403).json({ message: 'Admin accounts cannot be created this way' })
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' })
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create the user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            role: role || 'rider',
            isApproved: role === 'rider' ? true : false,
            vehicle: role === 'driver' ? vehicle : undefined
        })

        await user.save()

        res.status(201).json({ message: 'Registration successful' })

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
})

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        // Find user
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' })
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' })
        }

        // Check if driver is approved
        if (user.role === 'driver' && !user.isApproved) {
            return res.status(403).json({ message: 'Your account is pending admin approval' })
        }

        res.json(sessionFor(user))

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
})



// Forgot password: email a one-time reset link (valid for 1 hour)
router.post('/forgot-password', async (req, res) => {
    // Same reply whether or not the account exists, so emails can't be probed
    const reply = { message: 'If an account exists for that email, we sent a link to reset your password.' }
    try {
        const { email } = req.body
        if (!email || typeof email !== 'string') {
            return res.status(400).json({ message: 'Email is required' })
        }

        // On Render (production), don't pretend an email was sent if Gmail isn't set up
        if (process.env.RENDER && !isMailConfigured()) {
            return res.status(503).json({ message: 'Password reset by email is not available yet. Please contact support.' })
        }

        const user = await findByEmail(email.trim())
        if (!user) return res.json(reply)

        const token = crypto.randomBytes(32).toString('hex')
        user.resetPasswordToken = hashToken(token)
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000)
        await user.save()

        const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '')
        try {
            await sendPasswordResetEmail(user.email, user.name, `${clientUrl}/reset-password/${token}`)
        } catch (mailErr) {
            console.error('Password reset email failed:', mailErr.message)
            user.resetPasswordToken = undefined
            user.resetPasswordExpires = undefined
            await user.save()
            return res.status(500).json({ message: "We couldn't send the reset email. Please try again later." })
        }

        res.json(reply)
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
})

// Reset password using the token from the emailed link
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { password } = req.body
        if (!password || typeof password !== 'string' || password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' })
        }

        const user = await User.findOne({
            resetPasswordToken: hashToken(req.params.token),
            resetPasswordExpires: { $gt: new Date() }
        })
        if (!user) {
            return res.status(400).json({ message: 'This reset link is invalid or has expired. Please request a new one.' })
        }

        user.password = await bcrypt.hash(password, 10)
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined
        await user.save()

        res.json({ message: 'Your password has been updated. You can now sign in.' })
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
})

// Sign in with Google. New emails get a rider account; existing accounts are linked.
router.post('/google', async (req, res) => {
    try {
        if (!process.env.GOOGLE_CLIENT_ID) {
            return res.status(503).json({ message: 'Google sign-in is not configured yet' })
        }
        const { accessToken } = req.body
        if (!accessToken) return res.status(400).json({ message: 'Missing Google token' })

        let info
        try {
            info = await googleClient.getTokenInfo(accessToken)
        } catch {
            return res.status(401).json({ message: 'Google sign-in failed. Please try again.' })
        }
        // The token must have been issued to this app
        if (info.aud !== process.env.GOOGLE_CLIENT_ID) {
            return res.status(401).json({ message: 'Google sign-in failed. Please try again.' })
        }
        if (!info.email || !info.email_verified) {
            return res.status(401).json({ message: 'Your Google email address is not verified' })
        }

        let user = await findByEmail(info.email)
        if (!user) {
            let name = info.email.split('@')[0]
            try {
                const profile = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                })
                if (profile.ok) name = (await profile.json()).name || name
            } catch {
                // keep the fallback name
            }

            user = await User.create({
                name,
                email: info.email.toLowerCase(),
                // Random password: the account signs in with Google (or resets a password later)
                password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10),
                role: 'rider',
                isApproved: true,
                googleId: info.sub
            })
        } else if (!user.googleId) {
            user.googleId = info.sub
            await user.save()
        }

        if (user.role === 'driver' && !user.isApproved) {
            return res.status(403).json({ message: 'Your account is pending admin approval' })
        }

        res.json(sessionFor(user))
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
})

// Get all pending drivers (admin only)
router.get('/pending-drivers', protect, authorize('ops_manager', 'super_admin'), async (req, res) => {
    try {
        const drivers = await User.find({ role: 'driver', isApproved: false })
            .select('-password')
        res.json(drivers)
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
})

// Approve or reject a driver (admin only)
router.patch('/drivers/:id/approve', protect, authorize('ops_manager', 'super_admin'), async (req, res) => {
    try {
        const { approved } = req.body
        // Only driver accounts can be approved/rejected here
        const user = await User.findOneAndUpdate(
            { _id: req.params.id, role: 'driver' },
            { isApproved: approved === true },
            { new: true }
        ).select('-password')
        if (!user) return res.status(404).json({ message: 'Driver not found' })
        res.json({ message: approved ? 'Driver approved' : 'Driver rejected', user })
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
})
module.exports = router