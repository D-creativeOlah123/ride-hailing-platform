const express = require('express')
const router = express.Router()
const Dispute = require('../models/Disputes')
const Trip = require('../models/Trip')
const { protect, authorize } = require('../middleware/auth')

router.post('/submit', protect, async (req, res) => {
    try {
        const { tripId, description } = req.body
        const trip = await Trip.findById(tripId)
        if (!trip) return res.status(404).json({ message: 'Trip not found' })
        const dispute = new Dispute({
            trip: tripId,
            submittedBy: req.user.id,
            description,
            status: 'open'
        })
        await dispute.save()
        res.status(201).json({ message: 'Dispute submitted successfully', dispute })
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
})

router.get('/all', protect, authorize('ops_manager', 'super_admin'), async (req, res) => {
    try {
        const disputes = await Dispute.find()
            .populate('trip')
            .populate('submittedBy', 'name email role')
            .populate('reviewedBy', 'name email')
            .sort({ createdAt: -1 })
        res.json(disputes)
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
})

router.patch('/:id/review', protect, authorize('ops_manager', 'super_admin'), async (req, res) => {
    try {
        const dispute = await Dispute.findById(req.params.id)
        if (!dispute) return res.status(404).json({ message: 'Dispute not found' })
        dispute.status = 'under_review'
        dispute.reviewedBy = req.user.id
        await dispute.save()
        res.json({ message: 'Dispute is now under review', dispute })
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
})

router.patch('/:id/escalate', protect, authorize('ops_manager'), async (req, res) => {
    try {
        const dispute = await Dispute.findById(req.params.id)
        if (!dispute) return res.status(404).json({ message: 'Dispute not found' })
        dispute.status = 'escalated'
        await dispute.save()
        res.json({ message: 'Dispute escalated to Super Admin', dispute })
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
})

router.patch('/:id/resolve', protect, authorize('super_admin'), async (req, res) => {
    try {
        const { resolution } = req.body
        const dispute = await Dispute.findById(req.params.id)
        if (!dispute) return res.status(404).json({ message: 'Dispute not found' })
        dispute.status = 'resolved'
        dispute.resolution = resolution
        dispute.reviewedBy = req.user.id
        await dispute.save()
        res.json({ message: 'Dispute resolved', dispute })
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
})

router.get('/mine', protect, async (req, res) => {
    try {
        const disputes = await Dispute.find({ submittedBy: req.user.id })
            .populate('trip')
            .sort({ createdAt: -1 })
        res.json(disputes)
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
})

module.exports = router