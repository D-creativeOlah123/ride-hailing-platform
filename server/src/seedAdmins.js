require('dotenv').config()

if (process.env.DNS_SERVERS) {
    require('dns').setServers(process.env.DNS_SERVERS.split(',').map(s => s.trim()))
}
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./models/User')

const admins = [
    {
        name: 'Super Admin',
        email: process.env.SUPER_ADMIN_EMAIL,
        password: process.env.SUPER_ADMIN_PASSWORD,
        phone: process.env.SUPER_ADMIN_PHONE,
        role: 'super_admin',
        isApproved: true
    },
    {
        name: 'Ops Manager',
        email: process.env.OPS_ADMIN_EMAIL,
        password: process.env.OPS_ADMIN_PASSWORD,
        phone: process.env.OPS_ADMIN_PHONE,
        role: 'ops_manager',
        isApproved: true
    }
]

const missing = admins.filter(a => !a.email || !a.password)
if (missing.length) {
    console.error('Set SUPER_ADMIN_* and OPS_ADMIN_* (EMAIL, PASSWORD, PHONE) in .env before seeding')
    process.exit(1)
}

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log('MongoDB connected!')
    for (const admin of admins) {
        const existing = await User.findOne({ email: admin.email, role: admin.role })
        if (existing) {
            console.log(`⚠ ${admin.role} already exists: ${admin.email}`)
            continue
        }
        const hashedPassword = await bcrypt.hash(admin.password, 10)
        await User.create({ ...admin, password: hashedPassword })
        console.log(`✅ Created ${admin.role}: ${admin.email}`)
    }
    process.exit()
}).catch(err => {
    console.error('Error:', err)
    process.exit(1)
})