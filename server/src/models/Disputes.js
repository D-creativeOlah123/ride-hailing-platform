const mongoose = require('mongoose')

const disputeSchema = new mongoose.Schema({
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    status: {
        type: String,
        enum: ['open', 'under_review', 'escalated', 'resolved'],
        default: 'open'
    },
    resolution: { type: String },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

module.exports = mongoose.model('Dispute', disputeSchema)