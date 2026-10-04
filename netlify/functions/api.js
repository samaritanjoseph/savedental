const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Default admin credentials
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'SaveDental@2024';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'samaritanjoseph@gmail.com';
const SENDER_EMAIL = process.env.ADMIN_EMAIL || 'samaritanjoseph@gmail.com';

function getAdminToken() {
  return crypto.createHash('sha256').update(ADMIN_PASSWORD).digest('hex');
}

function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
  const port = parseInt(process.env.SMTP_PORT || '2525', 10);
  const user = process.env.SMTP_USER || 'b02476001@smtp-brevo.com';
  const pass = process.env.SMTP_PASS || '';
  const secure = process.env.SMTP_SECURE === 'true';

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  // Extract path
  let reqPath = event.path || '';
  reqPath = reqPath.replace(/^\/\.netlify\/functions\/api/, '');
  reqPath = reqPath.replace(/^\/api/, '');
  if (!reqPath.startsWith('/')) {
    reqPath = '/' + reqPath;
  }

  const method = event.httpMethod;

  try {
    // ═══════════════════════════════════════════════════
    // 1. POST /api/bookings — Create booking & send emails
    // ═══════════════════════════════════════════════════
    if (method === 'POST' && (reqPath === '/bookings' || reqPath === '/bookings/')) {
      const data = JSON.parse(event.body || '{}');
      const { name, email, phone, service, date, time, notes } = data;

      if (!name || !email || !phone || !service || !date || !time) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Name, email, phone, service, date, and time are required.' }),
        };
      }

      // Send Emails via Brevo SMTP
      try {
        const transporter = getTransporter();

        // 1. Notify Admin
        await transporter.sendMail({
          from: `"Save Dental Website" <${SENDER_EMAIL}>`,
          to: ADMIN_EMAIL,
          subject: `📅 New Booking Request: ${service} for ${name}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
              <div style="background:#07863f;padding:20px;text-align:center;">
                <h2 style="color:white;margin:0;">📅 New Appointment Request</h2>
              </div>
              <div style="padding:20px;background:#f9f9f9;">
                <table style="width:100%;border-collapse:collapse;">
                  <tr><td style="padding:8px;font-weight:bold;">Patient:</td><td style="padding:8px;">${name}</td></tr>
                  <tr style="background:#f0f0f0;"><td style="padding:8px;font-weight:bold;">Email:</td><td style="padding:8px;">${email}</td></tr>
                  <tr><td style="padding:8px;font-weight:bold;">Phone:</td><td style="padding:8px;">${phone}</td></tr>
                  <tr style="background:#f0f0f0;"><td style="padding:8px;font-weight:bold;">Service:</td><td style="padding:8px;">${service}</td></tr>
                  <tr><td style="padding:8px;font-weight:bold;">Date:</td><td style="padding:8px;">${date}</td></tr>
                  <tr style="background:#f0f0f0;"><td style="padding:8px;font-weight:bold;">Time:</td><td style="padding:8px;">${time}</td></tr>
                  <tr><td style="padding:8px;font-weight:bold;">Notes:</td><td style="padding:8px;">${notes || 'None'}</td></tr>
                </table>
              </div>
            </div>`,
        });

        // 2. Send Patient Receipt
        if (email) {
          await transporter.sendMail({
            from: `"Save Dental Clinic" <${SENDER_EMAIL}>`,
            to: email,
            subject: `✅ We received your appointment request — Save Dental Clinic`,
            html: `
              <div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;">
                <div style="background:#07863f;padding:24px;text-align:center;">
                  <h2 style="color:white;margin:0;">Save Dental Clinic</h2>
                  <p style="color:#c8f5d8;margin:4px 0 0;">Appointment Request Received</p>
                </div>
                <div style="padding:24px;background:#fff;">
                  <h3 style="color:#07863f;">Hello ${name},</h3>
                  <p>Thank you for choosing Save Dental Clinic! We have received your appointment request.</p>
                  <div style="background:#f0fdf4;border-left:4px solid #07863f;padding:16px;margin:20px 0;border-radius:4px;">
                    <h4 style="margin:0 0 12px;color:#07863f;">Your Request Details</h4>
                    <p style="margin:6px 0;"><strong>Service:</strong> ${service}</p>
                    <p style="margin:6px 0;"><strong>Date:</strong> ${date}</p>
                    <p style="margin:6px 0;"><strong>Time:</strong> ${time}</p>
                  </div>
                  <p>We will call you at <strong>${phone}</strong> to confirm your appointment.</p>
                  <p style="margin-top:28px;color:#777;">Warm regards,<br><strong style="color:#07863f;">Save Dental Clinic Team</strong></p>
                </div>
                <div style="background:#f4f4f4;padding:12px;text-align:center;font-size:12px;color:#999;">
                  Save Dental Clinic, Dikat House, First Floor, Complex A1 No. 60 Ring Road, Ibadan | Phone: +234 815 228 7675
                </div>
              </div>`,
          });
        }
      } catch (mailErr) {
        console.error('SMTP sending error:', mailErr);
      }

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ message: 'Booking created successfully', id: Date.now() }),
      };
    }

    // ═══════════════════════════════════════════════════
    // 2. GET /api/availability — Returns slot availability
    // ═══════════════════════════════════════════════════
    if (method === 'GET' && (reqPath === '/availability' || reqPath === '/availability/')) {
      const date = (event.queryStringParameters && event.queryStringParameters.date) || '';
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ date, taken: [] }),
      };
    }

    // ═══════════════════════════════════════════════════
    // 3. GET/POST /api/reviews — Reviews list & submission
    // ═══════════════════════════════════════════════════
    if (reqPath === '/reviews' || reqPath === '/reviews/') {
      if (method === 'GET') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify([
            { id: 1, name: 'Adewale O.', rating: 5, comment: 'Dr. and the team made my scaling and polishing completely painless. Very professional!', created_at: new Date().toISOString() },
            { id: 2, name: 'Fatima B.', rating: 5, comment: 'Best dental clinic in Ibadan. Clean environment and friendly staff.', created_at: new Date().toISOString() },
            { id: 3, name: 'Chinedu E.', rating: 5, comment: 'Quick emergency relief for my severe toothache. Highly recommended!', created_at: new Date().toISOString() },
          ]),
        };
      }
      if (method === 'POST') {
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ message: 'Review submitted, pending approval.', id: Date.now() }),
        };
      }
    }

    // ═══════════════════════════════════════════════════
    // 4. GET /api/gallery — Gallery items
    // ═══════════════════════════════════════════════════
    if (method === 'GET' && (reqPath === '/gallery' || reqPath === '/gallery/')) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([]),
      };
    }

    // ═══════════════════════════════════════════════════
    // 5. GET /api/settings — Site settings
    // ═══════════════════════════════════════════════════
    if (method === 'GET' && (reqPath === '/settings' || reqPath === '/settings/')) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({}),
      };
    }

    // ═══════════════════════════════════════════════════
    // 6. POST /api/admin/login — Admin verification
    // ═══════════════════════════════════════════════════
    if (method === 'POST' && (reqPath === '/admin/login' || reqPath === '/admin/login/')) {
      const data = JSON.parse(event.body || '{}');
      if (data.password !== ADMIN_PASSWORD) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Incorrect password' }),
        };
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ token: getAdminToken() }),
      };
    }

    // Default route
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ status: 'ok', service: 'Save Dental Serverless API' }),
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal Server Error' }),
    };
  }
};
