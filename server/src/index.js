require('dotenv').config()

// Some networks (e.g. certain Windows setups) refuse the SRV lookups that
// mongodb+srv:// needs. Set DNS_SERVERS=8.8.8.8,1.1.1.1 to use public DNS instead.
if (process.env.DNS_SERVERS) {
    require('dns').setServers(process.env.DNS_SERVERS.split(',').map(s => s.trim()))
}

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const authRoutes = require('./routes/auth')
const tripRoutes = require('./routes/trips')
const disputeRoutes = require('./routes/disputes')

const app = express()

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected!'))
    .catch((err) => console.log('MongoDB connection error:', err))

app.use('/api/auth', authRoutes)
app.use('/api/trips', tripRoutes)
app.use('/api/disputes', disputeRoutes)

app.get('/', (req, res) => {
    res.json({ message: 'Ride-hailing API is running!' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})