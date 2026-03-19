const BREVO_API_KEY = process.env.BREVO_API_KEY!
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'amnamubeen516@gmail.com'
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'Crochet Masterpiece'

interface SendEmailOptions {
  to: string
  toName?: string
  subject: string
  htmlContent: string
  textContent?: string
}

export async function sendEmail({ to, toName, subject, htmlContent, textContent }: SendEmailOptions) {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: to, name: toName || to }],
      subject,
      htmlContent,
      textContent: textContent || htmlContent.replace(/<[^>]*>/g, ''),
    }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(`Brevo error: ${JSON.stringify(err)}`)
  }

  return await response.json()
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function sendOTPEmail(email: string, name: string, purpose: 'reset' | 'verify' | 'profile_update' = 'reset') {
  const otp = generateOTP()

  const purposeText = {
    reset: 'reset your password',
    verify: 'verify your email address',
    profile_update: 'confirm your profile changes',
  }[purpose]

  const subject = {
    reset: '🌸 Reset Your Password - Crochet Masterpiece',
    verify: '🌸 Verify Your Email - Crochet Masterpiece',
    profile_update: '🌸 Confirm Profile Update - Crochet Masterpiece',
  }[purpose]

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body style="margin:0;padding:0;background:#fdf2f8;font-family:Arial,sans-serif;">
      <div style="max-width:560px;margin:40px auto;padding:0 16px;">
        <div style="background:white;border-radius:24px;overflow:hidden;box-shadow:0 4px 20px rgba(244,63,94,0.12);">
          
          <!-- Header -->
          <div style="background:linear-gradient(135deg,#fb7185,#ec4899,#f43f5e);padding:40px 40px 32px;text-align:center;">
            <div style="font-size:36px;margin-bottom:8px;">🧶</div>
            <h1 style="color:white;margin:0;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Crochet Masterpiece</h1>
            <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Handcrafted with love, made for you</p>
          </div>
          
          <!-- Body -->
          <div style="padding:40px;text-align:center;">
            <h2 style="color:#3d1520;font-size:20px;margin:0 0 12px;font-weight:600;">Hi ${name}! 🌸</h2>
            <p style="color:#6b2737;font-size:15px;margin:0 0 32px;line-height:1.6;">
              You requested to ${purposeText}. Use the verification code below:
            </p>
            
            <!-- OTP Box -->
            <div style="background:linear-gradient(135deg,#fff1f2,#fce7f3);border:2px dashed #fda4af;border-radius:16px;padding:28px;margin:0 0 32px;">
              <p style="color:#be185d;font-size:13px;font-weight:600;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">Your Verification Code</p>
              <div style="font-size:42px;font-weight:800;color:#f43f5e;letter-spacing:12px;font-family:monospace;">${otp}</div>
              <p style="color:#9d174d;font-size:13px;margin:12px 0 0;">⏱️ Expires in 10 minutes</p>
            </div>
            
            <p style="color:#9d174d;font-size:13px;margin:0;line-height:1.6;">
              If you didn't request this, please ignore this email.<br>
              Your account is safe. 💖
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background:#fdf2f8;padding:24px 40px;text-align:center;border-top:1px solid #fecdd3;">
            <p style="color:#be185d;font-size:13px;margin:0;">
              With love, <strong>Crochet Masterpiece Team</strong> 🧶
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({ to: email, toName: name, subject, htmlContent })
  return otp
}

export async function sendOrderConfirmationEmail(
  email: string,
  name: string,
  orderNumber: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  total: number
) {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #fecdd3;color:#3d1520;">${item.name}</td>
      <td style="padding:12px 0;border-bottom:1px solid #fecdd3;color:#6b2737;text-align:center;">${item.quantity}</td>
      <td style="padding:12px 0;border-bottom:1px solid #fecdd3;color:#f43f5e;text-align:right;font-weight:600;">₨${item.price.toLocaleString()}</td>
    </tr>
  `).join('')

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#fdf2f8;font-family:Arial,sans-serif;">
      <div style="max-width:560px;margin:40px auto;padding:0 16px;">
        <div style="background:white;border-radius:24px;overflow:hidden;box-shadow:0 4px 20px rgba(244,63,94,0.12);">
          <div style="background:linear-gradient(135deg,#fb7185,#ec4899,#f43f5e);padding:40px;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">🎉</div>
            <h1 style="color:white;margin:0;font-size:22px;">Order Confirmed!</h1>
            <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">Order #${orderNumber}</p>
          </div>
          <div style="padding:40px;">
            <p style="color:#3d1520;font-size:15px;">Hi <strong>${name}</strong>! Thank you for your order 🌸</p>
            <table style="width:100%;border-collapse:collapse;margin:24px 0;">
              <thead>
                <tr style="border-bottom:2px solid #fecdd3;">
                  <th style="text-align:left;padding:8px 0;color:#be185d;font-size:13px;">Item</th>
                  <th style="text-align:center;padding:8px 0;color:#be185d;font-size:13px;">Qty</th>
                  <th style="text-align:right;padding:8px 0;color:#be185d;font-size:13px;">Price</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding:16px 0 0;font-weight:700;color:#3d1520;">Total</td>
                  <td style="padding:16px 0 0;font-weight:800;color:#f43f5e;text-align:right;font-size:18px;">₨${total.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
            <p style="color:#6b2737;font-size:14px;">We'll contact you soon to confirm your delivery details. 💖</p>
          </div>
          <div style="background:#fdf2f8;padding:24px 40px;text-align:center;border-top:1px solid #fecdd3;">
            <p style="color:#be185d;font-size:13px;margin:0;">Crochet Masterpiece 🧶</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({ to: email, toName: name, subject: `🌸 Order Confirmed #${orderNumber} - Crochet Masterpiece`, htmlContent })
}
