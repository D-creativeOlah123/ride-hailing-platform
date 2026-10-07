const nodemailer = require('nodemailer')

// Sends email one of three ways, in this order of preference:
//  1. EmailJS (EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY) —
//     sends through a connected Gmail account over HTTPS; works on Render's free plan, which blocks SMTP.
//     Uses a template set up in the EmailJS dashboard (params: to_email, to_name, reset_link).
//  2. Brevo HTTP API (BREVO_API_KEY).
//  3. Gmail SMTP with an App Password (GMAIL_USER + GMAIL_APP_PASSWORD) — fine locally / on paid hosts.
// The sender address for Brevo/Gmail is MAIL_FROM, or GMAIL_USER if MAIL_FROM isn't set.
// With none configured, emails are logged to the console (handy for local development).
const senderEmail = () => process.env.MAIL_FROM || process.env.GMAIL_USER

const useEmailJS = () => Boolean(
    process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ID &&
    process.env.EMAILJS_PUBLIC_KEY && process.env.EMAILJS_PRIVATE_KEY
)
const useBrevo = () => Boolean(process.env.BREVO_API_KEY && senderEmail())
const useGmail = () => Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)
const isConfigured = () => useEmailJS() || useBrevo() || useGmail()

const sendWithEmailJS = async (templateParams) => {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            service_id: process.env.EMAILJS_SERVICE_ID,
            template_id: process.env.EMAILJS_TEMPLATE_ID,
            user_id: process.env.EMAILJS_PUBLIC_KEY,
            accessToken: process.env.EMAILJS_PRIVATE_KEY,
            template_params: templateParams,
        }),
        signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) {
        const detail = await res.text().catch(() => '')
        throw new Error(`EmailJS responded ${res.status}: ${detail.slice(0, 300)}`)
    }
}

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

    if (useEmailJS()) {
        return sendWithEmailJS({ to_email: to, to_name: firstName, reset_link: link })
    }

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
