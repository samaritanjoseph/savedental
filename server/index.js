import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';
import db from './db.js';
import { startCronJobs } from './cron.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const isProduction = !!process.env.CORS_ORIGIN;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (isProduction) {
      return origin === process.env.CORS_ORIGIN
        ? callback(null, true)
        : callback(new Error('Not allowed by CORS'));
    }
    return callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Rate Limiters
const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Too many bookings from this IP, try again later' }
});

const PORT = process.env.PORT || 3001;

// --- Simple Admin Auth ---
// Token = sha256 of ADMIN_PASSWORD. No JWT library needed.
function getAdminToken() {
  const pw = process.env.ADMIN_PASSWORD || 'savedental2024';
  return crypto.createHash('sha256').update(pw).digest('hex');
}

function adminAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  if (token !== getAdminToken()) return res.sendStatus(403);
  next();
}

// --- Nodemailer Setup ---
let transporter;
async function initMailer() {
  try {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      console.log(`Email Service Initialized using real SMTP (${process.env.SMTP_HOST}).`);
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
      console.log(`Email Service Initialized (Ethereal test mode).`);
    }
  } catch (error) {
    console.warn(`Failed to initialize Email service:`, error.message);
    transporter = null;
  }
  startCronJobs(transporter);
}
initMailer();

// ═══════════════════════════════════════════════════════════
//  PUBLIC ROUTES
// ═══════════════════════════════════════════════════════════

// POST /api/admin/login — verify admin password
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });
  const adminPassword = process.env.ADMIN_PASSWORD || 'savedental2024';
  if (password !== adminPassword) {
    return res.status(401).json({ error: 'Incorrect password' });
  }
  res.json({ token: getAdminToken() });
});

// Create Booking (Public)
app.post('/api/bookings', bookingLimiter, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('service').trim().notEmpty().withMessage('Service is required'),
  body('date').isDate().withMessage('Valid date is required'),
  body('time').trim().notEmpty().withMessage('Time is required'),
  body('notes').optional().trim().escape()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, phone, service, date, time, notes } = req.body;

  db.run(
    `INSERT INTO appointments (name, email, phone, service, date, time, notes) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, email, phone, service, date, time, notes],
    async function (err) {
      if (err) return res.status(500).json({ error: err.message });

      if (transporter) {
        try {
          const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
          const senderEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;

          // Notify admin
          await transporter.sendMail({
            from: `"Save Dental Website" <${senderEmail}>`,
            to: adminEmail,
            subject: `📅 New Booking Request: ${service} for ${name}`,
            attachments: [{ filename: 'save-dental-profile.jpg', path: path.join(__dirname, '../public/images/save-dental-profile.jpg'), cid: 'savelogo' }],
            html: `
              <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
                <div style="background:#07863f;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
                  <img src="cid:savelogo" alt="Logo" style="height:50px;border-radius:50%;border:2px solid white;vertical-align:middle;margin-right:10px;" />
                  <h2 style="color:white;margin:0;display:inline-block;vertical-align:middle;">New Appointment Request</h2>
                </div>
                <div style="padding:20px;background:#f9f9f9;border:1px solid #e0e0e0;">
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
              </div>`
          });

          // Receipt to patient
          if (email) {
            await transporter.sendMail({
              from: `"Save Dental Clinic" <${senderEmail}>`,
              to: email,
              subject: `✅ We received your appointment request — Save Dental Clinic`,
              attachments: [{ filename: 'save-dental-profile.jpg', path: path.join(__dirname, '../public/images/save-dental-profile.jpg'), cid: 'savelogo' }],
              html: `
                <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
                  <div style="background:#07863f;padding:24px;border-radius:8px 8px 0 0;text-align:center;">
                    <img src="cid:savelogo" alt="Logo" style="height:60px;border-radius:50%;border:2px solid white;margin-bottom:10px;" />
                    <h2 style="color:white;margin:0;">Save Dental Clinic</h2>
                    <p style="color:#c8f5d8;margin:4px 0 0;">Appointment Request Received</p>
                  </div>
                  <div style="padding:24px;background:#fff;border:1px solid #e5e5e5;">
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
                  <div style="background:#f4f4f4;padding:12px;text-align:center;font-size:12px;color:#999;border-radius:0 0 8px 8px;">
                    Save Dental Clinic, Ibadan | Automated message.
                  </div>
                </div>`
            });
          }
        } catch (emailError) {
          console.error('Failed to send notification emails:', emailError.message);
        }
      }

      res.status(201).json({ message: 'Booking created successfully', id: this.lastID });
    }
  );
});

// Get slot availability (Public)
app.get('/api/availability', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date query param required' });
  db.all(
    `SELECT time FROM appointments WHERE date = ? AND status != 'Cancelled'`,
    [date],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ date, taken: rows.map(r => r.time) });
    }
  );
});

// Get approved reviews (Public)
app.get('/api/reviews', (req, res) => {
  db.all('SELECT * FROM reviews WHERE is_approved = 1 ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Submit a review (Public — requires admin approval)
app.post('/api/reviews', [
  body('name').trim().notEmpty().escape(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').trim().notEmpty().escape()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { name, rating, comment } = req.body;
  db.run('INSERT INTO reviews (name, rating, comment, is_approved) VALUES (?, ?, ?, 0)', [name, rating, comment], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Review submitted, pending approval.', id: this.lastID });
  });
});

// Get gallery (Public)
app.get('/api/gallery', (req, res) => {
  db.all('SELECT * FROM gallery ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get site settings (Public)
app.get('/api/settings', (req, res) => {
  db.all('SELECT key, value FROM settings', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const obj = {};
    rows.forEach(r => { try { obj[r.key] = JSON.parse(r.value); } catch { obj[r.key] = r.value; } });
    res.json(obj);
  });
});

// ═══════════════════════════════════════════════════════════
//  ADMIN ROUTES (password protected)
// ═══════════════════════════════════════════════════════════

// Get all bookings
app.get('/api/bookings', adminAuth, (req, res) => {
  db.all('SELECT * FROM appointments ORDER BY date ASC, time ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Update booking status (triggers patient email on Confirmed/Cancelled)
app.patch('/api/bookings/:id', adminAuth, (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  db.run('UPDATE appointments SET status = ? WHERE id = ?', [status, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    if ((status === 'Confirmed' || status === 'Cancelled') && transporter) {
      db.get('SELECT * FROM appointments WHERE id = ?', [id], async (err, booking) => {
        if (!err && booking && booking.email) {
          try {
            const senderEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
            const isConfirmed = status === 'Confirmed';
            await transporter.sendMail({
              from: `"Save Dental Clinic" <${senderEmail}>`,
              to: booking.email,
              subject: isConfirmed
                ? `🦷 Your appointment is CONFIRMED — Save Dental Clinic`
                : `❌ Update on your appointment — Save Dental Clinic`,
              attachments: [{ filename: 'save-dental-profile.jpg', path: path.join(__dirname, '../public/images/save-dental-profile.jpg'), cid: 'savelogo' }],
              html: isConfirmed ? `
                <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
                  <div style="background:#07863f;padding:24px;border-radius:8px 8px 0 0;text-align:center;">
                    <img src="cid:savelogo" alt="Logo" style="height:60px;border-radius:50%;border:2px solid white;margin-bottom:10px;" />
                    <h2 style="color:white;margin:0;">✅ Appointment Confirmed!</h2>
                  </div>
                  <div style="padding:24px;background:#fff;border:1px solid #e5e5e5;">
                    <h3 style="color:#07863f;">Hello ${booking.name},</h3>
                    <p>Your appointment has been <strong>confirmed</strong>. We look forward to seeing you!</p>
                    <div style="background:#f0fdf4;border-left:4px solid #07863f;padding:16px;margin:20px 0;border-radius:4px;">
                      <p style="margin:6px 0;"><strong>Service:</strong> ${booking.service}</p>
                      <p style="margin:6px 0;"><strong>Date:</strong> ${booking.date}</p>
                      <p style="margin:6px 0;"><strong>Time:</strong> ${booking.time}</p>
                    </div>
                    <p>⏰ Please arrive <strong>10 minutes early</strong>.</p>
                    <p style="margin-top:28px;color:#777;">See you soon,<br><strong style="color:#07863f;">Save Dental Clinic Team</strong></p>
                  </div>
                </div>` : `
                <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
                  <div style="background:#dc2626;padding:24px;border-radius:8px 8px 0 0;text-align:center;">
                    <img src="cid:savelogo" alt="Logo" style="height:60px;border-radius:50%;border:2px solid white;margin-bottom:10px;" />
                    <h2 style="color:white;margin:0;">Appointment Update</h2>
                  </div>
                  <div style="padding:24px;background:#fff;border:1px solid #e5e5e5;">
                    <h3 style="color:#dc2626;">Hello ${booking.name},</h3>
                    <p>We are unable to confirm your appointment for the selected slot.</p>
                    <p>📞 Please call us to find an alternative time.</p>
                    <p style="margin-top:28px;color:#777;">Warm regards,<br><strong style="color:#07863f;">Save Dental Clinic Team</strong></p>
                  </div>
                </div>`
            });
          } catch (e) {
            console.error('Failed to send status email:', e.message);
          }
        }
      });
    }

    res.json({ message: 'Status updated' });
  });
});

// Delete booking
app.delete('/api/bookings/:id', adminAuth, (req, res) => {
  db.run('DELETE FROM appointments WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Booking deleted' });
  });
});

// Get ALL reviews (including unapproved)
app.get('/api/admin/reviews', adminAuth, (req, res) => {
  db.all('SELECT * FROM reviews ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Approve / unapprove a review
app.patch('/api/reviews/:id', adminAuth, (req, res) => {
  const { is_approved } = req.body;
  db.run('UPDATE reviews SET is_approved = ? WHERE id = ?', [is_approved ? 1 : 0, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Review updated' });
  });
});

// Delete review
app.delete('/api/reviews/:id', adminAuth, (req, res) => {
  db.run('DELETE FROM reviews WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Review deleted' });
  });
});

// Upload gallery item
app.post('/api/gallery', adminAuth, upload.fields([{ name: 'before', maxCount: 1 }, { name: 'after', maxCount: 1 }]), (req, res) => {
  const { title, description } = req.body;
  if (!title || !req.files['before'] || !req.files['after']) {
    return res.status(400).json({ error: 'Title and both before/after images are required' });
  }
  const before_url = '/uploads/' + req.files['before'][0].filename;
  const after_url = '/uploads/' + req.files['after'][0].filename;
  db.run('INSERT INTO gallery (title, before_url, after_url, description) VALUES (?, ?, ?, ?)',
    [title, before_url, after_url, description || null],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Gallery item added', id: this.lastID, before_url, after_url });
    }
  );
});

// Delete gallery item
app.delete('/api/gallery/:id', adminAuth, (req, res) => {
  db.get('SELECT * FROM gallery WHERE id = ?', [req.params.id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Not found' });
    try {
      fs.unlinkSync(path.join(__dirname, row.before_url));
      fs.unlinkSync(path.join(__dirname, row.after_url));
    } catch (e) {
      console.warn('Could not delete image files:', e.message);
    }
    db.run('DELETE FROM gallery WHERE id = ?', [req.params.id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Gallery item deleted' });
    });
  });
});

// Save site settings
app.put('/api/settings', adminAuth, (req, res) => {
  const entries = Object.entries(req.body);
  if (entries.length === 0) return res.status(400).json({ error: 'No settings provided' });
  const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  let error = null;
  entries.forEach(([key, value]) => {
    stmt.run([key, JSON.stringify(value)], (err) => { if (err) error = err; });
  });
  stmt.finalize((err) => {
    if (err || error) return res.status(500).json({ error: (err || error).message });
    res.json({ message: 'Settings saved successfully' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
