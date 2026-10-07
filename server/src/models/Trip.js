const mongoose = require('mongoose')

const tripSchema = new mongoose.Schema({
    rider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    pickupLocation: { type: String, required: true },
    destination: { type: String, required: true },
    status: {
        type: String,
        enum: ['requested', 'accepted', 'driver_arriving', 'trip_started', 'completed', 'cancelled'],
        default: 'requested'
    },
    fare: { type: Number },
    duration: { type: Number },
    cancelledBy: { type: String },
    // Set from the server-side estimate when the ride is requested
    rideType: { type: String, enum: ['economy', 'comfort', 'xl'], default: 'economy' },
    distanceKm: { type: Number },
    pricePeriod: { type: String },
    payment: {
        status: { type: String, enum: ['unpaid', 'pending', 'paid'], default: 'unpaid' },
        method: { type: String },          // card, bank_transfer, ussd… (from Paystack)
        reference: { type: String },       // latest Paystack reference
        amount: { type: Number },          // naira actually paid
        paidAt: { type: Date }
    }
}, { timestamps: true })

module.exports = mongoose.model('Trip', tripSchema)