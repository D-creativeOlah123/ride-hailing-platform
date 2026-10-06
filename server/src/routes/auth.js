const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { protect, authorize } = require('../middleware/auth')

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

        // Create token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved
            }
        })

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