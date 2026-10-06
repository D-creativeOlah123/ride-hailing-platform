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
    cancelledBy: { type: String }
}, { timestamps: true })

module.exports = mongoose.model('Trip', tripSchema)