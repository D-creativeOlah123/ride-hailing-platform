const nodemailer = require('nodemailer')

// Sends email one of two ways:
//  1. Brevo HTTP API (BREVO_API_KEY) — works on hosts that block SMTP, like Render's free plan.
//  2. Gmail SMTP with an App Password (GMAIL_USER + GMAIL_APP_PASSWORD) — fine locally / on paid hosts.
// The sender address is MAIL_FROM, or GMAIL_USER if MAIL_FROM isn't set. For Brevo it must be
// a sender verified in the Brevo dashboard.
// With neither configured, emails are logged to the console (handy for local development).
const senderEmail = () => process.env.MAIL_FROM || process.env.GMAIL_USER

const useBrevo = () => Boolean(process.env.BREVO_API_KEY && senderEmail())
const useGmail = () => Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)
const isConfigured = () => useBrevo() || useGmail()

const sendWithBrevo = async ({ to, subject, text, html }) => {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'api-key': process.env.BREVO_API_KEY,
            'content-type': 'application/json',
            accept: 'application/json',
        },
        body: JSON.stringify({
            sender: { name: 'RideLink', email: senderEmail() },
            to: [{ email: to }],
            subject,
            textContent: text,
            htmlContent: html,
        }),
        signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) {
        const detail = await res.text().catch(() => '')
        throw new Error(`Brevo responded ${res.status}: ${detail.slice(0, 300)}`)
    }
}

let transporter
const sendWithGmail = ({ to, subject, text, html }) => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD.replace(/\s+/g, ''),
            },
            // Fail fast instead of hanging for minutes if SMTP is blocked
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 15000,
        })
    }
    return transporter.sendMail({ from: `"RideLink" <${senderEmail()}>`, to, subject, text, html })
}

const sendMail = async (message) => {
    if (useBrevo()) return sendWithBrevo(message)
    if (useGmail()) return sendWithGmail(message)
    console.log(`[mailer] Email not configured. Would send to ${message.to}: ${message.subject}\n${message.text}`)
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
