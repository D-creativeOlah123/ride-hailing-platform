const mongoose = require('mongoose')

// In-app chat between the rider and driver of a trip
const messageSchema = new mongoose.Schema({
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['rider', 'driver'], required: true },
    text: { type: String, required: true, maxlength: 500 }
}, { timestamps: true })

module.exports = mongoose.model('Message', messageSchema)
