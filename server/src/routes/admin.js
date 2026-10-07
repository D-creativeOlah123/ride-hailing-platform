const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Trip = require('../models/Trip')
const Dispute = require('../models/Disputes')
const { protect, authorize } = require('../middleware/auth')

router.use(protect, authorize('ops_manager', 'super_admin'))

const countBy = (rows) => Object.fromEntries(rows.map(r => [r._id, r.count]))

// Platform-wide numbers for the admin dashboard and analytics pages
router.get('/overview', async (req, res) => {
    try {
        // First day of the month, 11 months ago → 12 calendar months including this one
        const now = new Date()
        const since = new Date(now.getFullYear(), now.getMonth() - 11, 1)

        const [usersByRole, pendingDrivers, tripsByStatus, revenueAgg, monthlyAgg, disputesByStatus] = await Promise.all([
            User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
            User.countDocuments({ role: 'driver', isApproved: false }),
            Trip.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
            Trip.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, total: { $sum: { $ifNull: ['$fare', 0] } } } }
            ]),
            Trip.aggregate([
                { $match: { createdAt: { $gte: since } } },
                {
                    $group: {
                        _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
                        trips: { $sum: 1 },
                        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                        revenue: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, { $ifNull: ['$fare', 0] }, 0] } }
                    }
                }
            ]),
            Dispute.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
        ])

        // Fill in all 12 months, oldest first, including months with no trips
        const monthly = []
        for (let i = 0; i < 12; i++) {
            const d = new Date(since.getFullYear(), since.getMonth() + i, 1)
            const hit = monthlyAgg.find(r => r._id.y === d.getFullYear() && r._id.m === d.getMonth() + 1)
            monthly.push({
                month: d.toLocaleString('en-US', { month: 'short' }),
                year: d.getFullYear(),
                trips: hit?.trips || 0,
                completed: hit?.completed || 0,
                revenue: hit?.revenue || 0
            })
        }

        const users = countBy(usersByRole)
        const trips = countBy(tripsByStatus)
        const disputes = countBy(disputesByStatus)

        res.json({
            users: {
                riders: users.rider || 0,
                drivers: users.driver || 0,
                pendingDrivers,
                admins: (users.ops_manager || 0) + (users.super_admin || 0)
            },
            trips: {
                total: Object.values(trips).reduce((a, b) => a + b, 0),
                byStatus: trips,
                revenue: revenueAgg[0]?.total || 0
            },
            disputes: {
                total: Object.values(disputes).reduce((a, b) => a + b, 0),
                byStatus: disputes
            },
            monthly
        })
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
})

// All trips on the platform, newest first (most recent 300)
router.get('/trips', async (req, res) => {
    try {
        const trips = await Trip.find()
            .populate('rider', 'name email phone')
            .populate('driver', 'name email phone')
            .sort({ createdAt: -1 })
            .limit(300)
        res.json(trips)
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
})

module.exports = router
