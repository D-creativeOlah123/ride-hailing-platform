const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: {
        type: String,
        enum: ['rider', 'driver', 'ops_manager', 'super_admin'],
        default: 'rider'
    },
    isApproved: { type: Boolean, default: false },
    vehicle: {
        make: String,
        model: String,
        year: String,
        plateNumber: String,
        licenseNumber: String
    }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)