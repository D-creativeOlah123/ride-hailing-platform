const nodemailer = require('nodemailer')

// Sends mail through a Gmail account using an App Password.
// Needs GMAIL_USER and GMAIL_APP_PASSWORD. Without them, emails are logged
// to the console instead (handy for local development).
const isConfigured = () => Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)

let transporter
const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD.replace(/\s+/g, ''),
            },
        })
    }
    return transporter
}

const sendMail = async ({ to, subject, text, html }) => {
    if (!isConfigured()) {
        console.log(`[mailer] Email not configured. Would send to ${to}: ${subject}\n${text}`)
        return
    }
    await getTransporter().sendMail({
        from: `"RideLink" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        text,
        html,
    })
}

const sendPasswordResetEmail = (to, name, link) => {
    const firstName = (name || '').split(' ')[0] || 'there'
    const text = [
        `Hi ${firstName},`,
        '',
        'We received a request to reset your RideLink password.',
        `Reset it here (link expires in 1 hour): ${link}`,
        '',
        "If you didn't ask for this, you can ignore this email — your password won't change.",
        '',
        '— RideLink',
    ].join('\n')

    const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#0e1525">
    <p style="font-size:15px;font-weight:600;margin:0 0 24px">RideLink</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px">Hi ${firstName},</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 24px">We received a request to reset your RideLink password. Click the button below to choose a new one. This link expires in 1 hour.</p>
    <a href="${link}" style="display:inline-block;background:#1f57e7;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 20px;border-radius:8px">Reset password</a>
    <p style="font-size:13px;line-height:1.6;color:#4f5869;margin:24px 0 0">If the button doesn't work, copy this link into your browser:<br><a href="${link}" style="color:#1d4fd8;word-break:break-all">${link}</a></p>
    <p style="font-size:13px;line-height:1.6;color:#4f5869;margin:24px 0 0">If you didn't ask for this, you can ignore this email — your password won't change.</p>
  </div>`

    return sendMail({ to, subject: 'Reset your RideLink password', text, html })
}

module.exports = { sendMail, sendPasswordResetEmail, isConfigured }
