const express = require('express')
const router = express.Router()
const Trip = require('../models/Trip')
const Message = require('../models/Message')
const { protect, authorize } = require('../middleware/auth')
const { PLACES, RIDE_TYPES, estimate, timeComparison } = require('../utils/pricing')

const CHAT_OPEN = ['accepted', 'driver_arriving', 'trip_started']

// Loads the trip and checks the user is its rider or driver. Returns { trip, role } or sends an error.
async function tripParticipant(req, res) {
    const trip = await Trip.findById(req.params.id).select('rider driver status')
    if (!trip) { res.status(404).json({ message: 'Trip not found' }); return null }
    const uid = req.user.id
    const role = trip.rider?.toString() === uid ? 'rider' : trip.driver?.toString() === uid ? 'driver' : null
    if (!role) { res.status(403).json({ message: 'Not your trip' }); return null }
    return { trip, role }
}

// Known Lagos places for pickup/destination autocomplete (public)
router.get('/places', (req, res) => {
    res.json(PLACES.map(p => ({ name: p.name, area: p.area, aliases: p.aliases || [] })))
})

// Fare estimate before booking: every ride type now, plus prices at other times (public)
router.post('/estimate', (req, res) => {
    const { pickupLocation, destination } = req.body
    const quote = estimate(pickupLocation, destination)
    if (!quote) return res.status(400).json({ message: 'Choose your pickup and destination from the list of Lagos locations' })
    if (quote.pickup === quote.destination) return res.status(400).json({ message: 'Pickup and destination must be different' })
    res.json({ ...quote, byTime: timeComparison(pickupLocation, destination) })
})

// Rider requests a trip
router.post('/request', protect, authorize('rider'), async (req, res) => {
    try {
        const { pickupLocation, destination, rideType = 'economy' } = req.body
        if (!RIDE_TYPES[rideType]) return res.status(400).json({ message: 'Unknown ride type' })

        // The fare is computed here (never trusted from the client) and fixed for the trip
        const quote = estimate(pickupLocation, destination)
        if (!quote) return res.status(400).json({ message: 'Choose your pickup and destination from the list of Lagos locations' })
        if (quote.pickup === quote.destination) return res.status(400).json({ message: 'Pickup and destination must be different' })

        const option = quote.options.find(o => o.type === rideType)
        // If the rider was shown a different price (e.g. rush-hour pricing started since), don't
        // silently charge the new one: send the fresh quote back so they can confirm it.
        const shown = Number(req.body.expectedFare)
        if (req.body.expectedFare !== undefined && shown !== option.fare) {
            return res.status(409).json({
                message: `The price has changed to ₦${option.fare.toLocaleString('en-NG')} (${quote.period.label.toLowerCase()} pricing). Tap Book again to confirm.`,
                estimate: { ...quote, byTime: timeComparison(pickupLocation, destination) },
            })
        }
        const trip = new Trip({
            rider: req.user.id,
            pickupLocation: quote.pickup,
            destination: quote.destination,
            status: 'requested',
            rideType,
            fare: option.fare,
            distanceKm: quote.distanceKm,
            duration: quote.durationMin,
            pricePeriod: quote.period.label
        })

        await trip.save()
        res.status(201).json({ message: 'Trip requested successfully', trip })

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
})

// Driver sees all available trip requests
router.get('/available', protect, authorize('driver'), async (req, res) => {
    try {
        const trips = await Trip.find({ status: 'requested' }).populate('rider', 'name phone')
        res.json(trips)
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
})

// Driver accepts a trip
router.patch('/:id/accept', protect, authorize('driver'), async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id)

        if (!trip) return res.status(404).json({ message: 'Trip not found' })
        if (trip.status !== 'requested') return res.status(400).json({ message: 'Trip is no longer available' })

        trip.driver = req.user.id
        trip.status = 'accepted'
        await trip.save()

        res.json({ message: 'Trip accepted', trip })
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
})

// Driver updates trip status
router.patch('/:id/status', protect, authorize('driver'), async (req, res) => {
    try {
        const { status } = req.body
        const allowedStatuses = ['driver_arriving', 'trip_started', 'completed']

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' })
        }

        const trip = await Trip.findById(req.params.id)
        if (!trip) return res.status(404).json({ message: 'Trip not found' })
        if (trip.driver.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not your trip' })
        }

        trip.status = status
        // Trips created before fares were set at request time get one on completion
        if (status === 'completed' && !trip.fare) {
            trip.fare = Math.floor(Math.random() * 3000) + 500
        }

        await trip.save()
        res.json({ message: 'Trip status updated', trip })

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
})

// Cancel a trip (rider or driver)
router.patch('/:id/cancel', protect, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id)
        if (!trip) return res.status(404).json({ message: 'Trip not found' })

        if (!['requested', 'accepted', 'driver_arriving'].includes(trip.status)) {
            return res.status(400).json({ message: 'Trip cannot be cancelled at this stage' })
        }

        trip.status = 'cancelled'
        trip.cancelledBy = req.user.role
        await trip.save()

        res.json({ message: 'Trip cancelled', trip })
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
})

// Get trip history for rider or driver
router.get('/history', protect, async (req, res) => {
    try {
        let trips

        if (req.user.role === 'rider') {
            trips = await Trip.find({ rider: req.user.id })
                .populate('driver', 'name phone vehicle')
                .sort({ createdAt: -1 })
        } else if (req.user.role === 'driver') {
            trips = await Trip.find({ driver: req.user.id })
                .populate('rider', 'name phone')
                .sort({ createdAt: -1 })
        }

        res.json(trips)
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
})

// Trip chat: list messages (rider or driver of the trip only)
router.get('/:id/messages', protect, async (req, res) => {
    try {
        const p = await tripParticipant(req, res)
        if (!p) return
        const messages = await Message.find({ trip: req.params.id }).sort({ createdAt: 1 }).limit(200)
        res.json({ messages, canSend: CHAT_OPEN.includes(p.trip.status) && !!p.trip.driver, role: p.role })
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
})

// Trip chat: send a message (only while a driver is assigned and the trip is in progress)
router.post('/:id/messages', protect, async (req, res) => {
    try {
        const p = await tripParticipant(req, res)
        if (!p) return
        if (!p.trip.driver || !CHAT_OPEN.includes(p.trip.status)) {
            return res.status(400).json({ message: 'Messaging is only available during an active trip' })
        }
        const text = typeof req.body.text === 'string' ? req.body.text.trim() : ''
        if (!text) return res.status(400).json({ message: 'Message cannot be empty' })
        if (text.length > 500) return res.status(400).json({ message: 'Message is too long (500 characters max)' })

        const message = await Message.create({ trip: p.trip._id, sender: req.user.id, senderRole: p.role, text })
        res.status(201).json(message)
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
})

// Get single trip details
router.get('/:id', protect, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id)
            .populate('rider', 'name phone email')
            .populate('driver', 'name phone email vehicle')

        if (!trip) return res.status(404).json({ message: 'Trip not found' })

        res.json(trip)
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
})

module.exports = router