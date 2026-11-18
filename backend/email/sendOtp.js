const nodemailer = require('nodemailer')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const buildOtpHtml = (otp) => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e7e5e4; border-radius: 16px;">
    <h2 style="color: #15803d; margin: 0 0 12px;">FreshBasket Verification Code</h2>
    <p style="color: #44403c; font-size: 14px; margin: 0 0 16px;">
      Use the 6-digit code below to sign in to your FreshBasket account:
    </p>
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; text-align: center; font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #14532d;">
      ${otp}
    </div>
    <p style="color: #78716c; font-size: 12px; margin: 16px 0 0;">
      This code is valid for 5 minutes. If you didn't request this, you can safely ignore this email.
    </p>
  </div>
`

// Option 1: Brevo HTTP API (port 443 - works on Render Free Tier, 300 free emails/day, no domain needed)
const sendViaBrevo = async (toEmail, otp) => {
  const senderEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER
  if (!senderEmail) {
    throw new Error('EMAIL_USER or EMAIL_FROM must be set to send via Brevo')
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: 'FreshBasket', email: senderEmail },
      to: [{ email: toEmail }],
      subject: 'Your FreshBasket OTP Code',
      htmlContent: buildOtpHtml(otp),
    }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || `Brevo API error (${response.status})`)
  }
  console.log('OTP sent via Brevo:', data.messageId || 'ok')
  return data
}

// Option 2: Resend HTTP API (port 443 - works on Render Free Tier)
const sendViaResend = async (toEmail, otp) => {
  const from = process.env.EMAIL_FROM || 'FreshBasket <onboarding@resend.dev>'
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from,
      to: [toEmail],
      subject: 'Your FreshBasket OTP Code',
      html: buildOtpHtml(otp),
    }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || `Resend API error (${response.status})`)
  }
  console.log('OTP sent via Resend:', data.id || 'ok')
  return data
}

// Option 3: Nodemailer Gmail SMTP (works locally or on paid hosts where port 587 is open)
const sendViaSmtp = async (toEmail, otp) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  const info = await transporter.sendMail({
    from: `"FreshBasket OTP" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your FreshBasket OTP Code',
    html: buildOtpHtml(otp),
  })

  console.log('OTP sent via SMTP:', info.messageId)
  return info
}

const sendOtp = async (email, otp) => {
  try {
    if (process.env.BREVO_API_KEY) {
      return await sendViaBrevo(email, otp)
    }
    if (process.env.RESEND_API_KEY) {
      return await sendViaResend(email, otp)
    }
    return await sendViaSmtp(email, otp)
  } catch (err) {
    console.error('Error while sending OTP mail:', err.message)
    throw err
  }
}

module.exports = sendOtp
