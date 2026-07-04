import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import db from './db.js';
import { startCronJobs } from './cron.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
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
const upload = multer({ storage });

// Rate Limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, try again later' }
});

const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Too many bookings from this IP, try again later' }
});

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_for_dev_only';

// --- Nodemailer Setup ---
let transporter;
async function initMailer() {
  try {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      // Use Real SMTP credentials from .env
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      console.log(`Email Service Initialized using real SMTP (${process.env.SMTP_HOST}).`);
    } else {
      // Fallback to Ethereal Email for development/testing
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`Email Service Initialized. Uses Ethereal Email for testing.`);
      console.log(`Note: To send real emails, add SMTP_HOST, SMTP_USER, and SMTP_PASS to your server/.env file.`);
    }
  } catch (error) {
    console.warn(`Failed to initialize Email service. Notifications disabled. Error:`, error.message);
    transporter = null;
  }
  
  startCronJobs(transporter);
}
initMailer();

// --- Auth Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

// --- Routes ---

// Login
app.post('/api/auth/login', loginLimiter, (req, res) => {
  const { email, password } = req.body;
  
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ email: user.email, id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, role: user.role });
  });
});

// Create Booking
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
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phone, service, date, time, notes } = req.body;
  
  db.run(
    `INSERT INTO appointments (name, email, phone, service, date, time, notes) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, email, phone, service, date, time, notes],
    async function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Send Email to Admin and Patient
      if (transporter) {
        try {
          const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
          const senderEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
          const adminMailOptions = {
            from: `"Save Dental Website" <${senderEmail}>`,
            to: adminEmail,
            subject: `📅 New Booking Request: ${service} for ${name}`,
            attachments: [{
              filename: 'save-dental-profile.jpg',
              path: path.join(__dirname, '../public/images/save-dental-profile.jpg'),
              cid: 'savelogo'
            }],
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background:#07863f; padding:20px; border-radius:8px 8px 0 0; text-align:center;">
                  <img src="cid:savelogo" alt="Save Dental Clinic Logo" style="height: 50px; border-radius: 50%; border: 2px solid white; vertical-align: middle; margin-right: 10px;" />
                  <h2 style="color:white; margin:0; display: inline-block; vertical-align: middle;">New Appointment Request</h2>
                </div>
                <div style="padding:20px; background:#f9f9f9; border:1px solid #e0e0e0;">
                  <p>A new appointment has been requested via the website.</p>
                  <table style="width:100%; border-collapse:collapse;">
                    <tr><td style="padding:8px; font-weight:bold;">Patient Name:</td><td style="padding:8px;">${name}</td></tr>
                    <tr style="background:#f0f0f0;"><td style="padding:8px; font-weight:bold;">Email:</td><td style="padding:8px;">${email}</td></tr>
                    <tr><td style="padding:8px; font-weight:bold;">Phone:</td><td style="padding:8px;">${phone}</td></tr>
                    <tr style="background:#f0f0f0;"><td style="padding:8px; font-weight:bold;">Service:</td><td style="padding:8px;">${service}</td></tr>
                    <tr><td style="padding:8px; font-weight:bold;">Date:</td><td style="padding:8px;">${date}</td></tr>
                    <tr style="background:#f0f0f0;"><td style="padding:8px; font-weight:bold;">Time:</td><td style="padding:8px;">${time}</td></tr>
                    <tr><td style="padding:8px; font-weight:bold;">Notes:</td><td style="padding:8px;">${notes || 'None'}</td></tr>
                  </table>
                  <br>
                  <a href="http://localhost:5174/admin" style="padding:12px 24px; background:#07863f; color:white; text-decoration:none; border-radius:6px; display:inline-block;">View Dashboard & Approve</a>
                </div>
              </div>
            `
          };
          const adminInfo = await transporter.sendMail(adminMailOptions);
          console.log('Admin Notification Sent to:', adminEmail);

          // 2. Patient Receipt on booking creation
          if (email) {
            const senderEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
            const patientMailOptions = {
              from: `"Save Dental Clinic" <${senderEmail}>`,
              to: email,
              subject: `✅ We received your appointment request — Save Dental Clinic`,
              attachments: [{
                filename: 'save-dental-profile.jpg',
                path: path.join(__dirname, '../public/images/save-dental-profile.jpg'),
                cid: 'savelogo'
              }],
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background:#07863f; padding:24px; border-radius:8px 8px 0 0; text-align:center;">
                    <img src="cid:savelogo" alt="Save Dental Clinic Logo" style="height: 60px; border-radius: 50%; border: 2px solid white; margin-bottom: 10px;" />
                    <h2 style="color:white; margin:0;">Save Dental Clinic</h2>
                    <p style="color:#c8f5d8; margin:4px 0 0;">Appointment Request Received</p>
                  </div>
                  <div style="padding:24px; background:#fff; border:1px solid #e5e5e5;">
                    <h3 style="color:#07863f;">Hello ${name},</h3>
                    <p>Thank you for choosing Save Dental Clinic! We have successfully received your appointment request and our team will review it shortly.</p>
                    
                    <div style="background:#f0fdf4; border-left:4px solid #07863f; padding:16px; margin:20px 0; border-radius:4px;">
                      <h4 style="margin:0 0 12px; color:#07863f;">Your Request Details</h4>
                      <p style="margin:6px 0;"><strong>Service:</strong> ${service}</p>
                      <p style="margin:6px 0;"><strong>Date:</strong> ${date}</p>
                      <p style="margin:6px 0;"><strong>Time:</strong> ${time}</p>
                    </div>
                    
                    <p><strong>What happens next?</strong></p>
                    <ul style="color:#555; line-height:1.8;">
                      <li>Our team will review your requested date and time.</li>
                      <li>You will receive a <strong>confirmation email</strong> once approved.</li>
                      <li>If we need to adjust the time, we will call you at <strong>${phone}</strong>.</li>
                    </ul>
                    
                    <p style="margin-top:28px; color:#777;">Warm regards,<br><strong style="color:#07863f;">Save Dental Clinic Team</strong></p>
                  </div>
                  <div style="background:#f4f4f4; padding:12px; text-align:center; font-size:12px; color:#999; border-radius:0 0 8px 8px;">
                    Save Dental Clinic, Ibadan | This is an automated message.
                  </div>
                </div>
              `
            };
            const patientInfo = await transporter.sendMail(patientMailOptions);
            console.log('Patient Receipt Sent to:', email);
          }
          
        } catch (emailError) {
          console.error('Failed to send notification emails:', emailError.message);
        }
      }
      
      res.status(201).json({ message: 'Booking created successfully', id: this.lastID });
    }
  );
});

// Get all bookings (Protected)
app.get('/api/bookings', authenticateToken, (req, res) => {
  db.all('SELECT * FROM appointments ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Delete booking (Protected)
app.delete('/api/bookings/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM appointments WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Booking deleted successfully' });
  });
});

// Get slot availability for a date
app.get('/api/availability', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date query param required' });
  db.all(
    `SELECT time FROM appointments WHERE date = ? AND status != 'Cancelled'`,
    [date],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const taken = rows.map(r => r.time);
      res.json({ date, taken });
    }
  );
});

// Update booking status (Protected)
app.patch('/api/bookings/:id', authenticateToken, (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  
  db.run('UPDATE appointments SET status = ? WHERE id = ?', [status, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // If confirmed or cancelled, send email to patient
    if (status === 'Confirmed' || status === 'Cancelled') {
      db.get('SELECT * FROM appointments WHERE id = ?', [id], async (err, booking) => {
        if (!err && booking && transporter) {
          try {
            const isConfirmed = status === 'Confirmed';
            const senderEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
            const mailOptions = {
              from: `"Save Dental Clinic" <${senderEmail}>`,
              to: booking.email,
              subject: isConfirmed 
                ? `🦷 Your appointment is CONFIRMED — Save Dental Clinic`
                : `❌ Update on your appointment request — Save Dental Clinic`,
              attachments: [{
                filename: 'save-dental-profile.jpg',
                path: path.join(__dirname, '../public/images/save-dental-profile.jpg'),
                cid: 'savelogo'
              }],
              html: isConfirmed 
                ? `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background:#07863f; padding:24px; border-radius:8px 8px 0 0; text-align:center;">
                    <img src="cid:savelogo" alt="Save Dental Clinic Logo" style="height: 60px; border-radius: 50%; border: 2px solid white; margin-bottom: 10px;" />
                    <h2 style="color:white; margin:0;">✅ Appointment Confirmed!</h2>
                    <p style="color:#c8f5d8; margin:4px 0 0;">Save Dental Clinic</p>
                  </div>
                  <div style="padding:24px; background:#fff; border:1px solid #e5e5e5;">
                    <h3 style="color:#07863f;">Hello ${booking.name},</h3>
                    <p>Great news! Your appointment at Save Dental Clinic has been <strong>confirmed</strong>. We look forward to seeing you!</p>
                    
                    <div style="background:#f0fdf4; border-left:4px solid #07863f; padding:16px; margin:20px 0; border-radius:4px;">
                      <h4 style="margin:0 0 12px; color:#07863f;">Appointment Details</h4>
                      <p style="margin:6px 0;"><strong>Service:</strong> ${booking.service}</p>
                      <p style="margin:6px 0;"><strong>Date:</strong> ${booking.date}</p>
                      <p style="margin:6px 0;"><strong>Time:</strong> ${booking.time}</p>
                    </div>
                    
                    <p>⏰ <strong>Please arrive 10 minutes early</strong> to complete any paperwork.</p>
                    <p>📞 If you need to reschedule, please call us as soon as possible.</p>
                    
                    <p style="margin-top:28px; color:#777;">See you soon,<br><strong style="color:#07863f;">Save Dental Clinic Team</strong></p>
                  </div>
                  <div style="background:#f4f4f4; padding:12px; text-align:center; font-size:12px; color:#999; border-radius:0 0 8px 8px;">
                    Save Dental Clinic, Ibadan | This is an automated message.
                  </div>
                </div>
              `
                : `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background:#dc2626; padding:24px; border-radius:8px 8px 0 0; text-align:center;">
                    <img src="cid:savelogo" alt="Save Dental Clinic Logo" style="height: 60px; border-radius: 50%; border: 2px solid white; margin-bottom: 10px;" />
                    <h2 style="color:white; margin:0;">Appointment Update</h2>
                    <p style="color:#fee2e2; margin:4px 0 0;">Save Dental Clinic</p>
                  </div>
                  <div style="padding:24px; background:#fff; border:1px solid #e5e5e5;">
                    <h3 style="color:#dc2626;">Hello ${booking.name},</h3>
                    <p>We are writing to inform you that we are unable to confirm your appointment request for the selected slot.</p>
                    
                    <div style="background:#fef2f2; border-left:4px solid #dc2626; padding:16px; margin:20px 0; border-radius:4px;">
                      <h4 style="margin:0 0 12px; color:#dc2626;">Requested Details</h4>
                      <p style="margin:6px 0;"><strong>Service:</strong> ${booking.service}</p>
                      <p style="margin:6px 0;"><strong>Date:</strong> ${booking.date}</p>
                      <p style="margin:6px 0;"><strong>Time:</strong> ${booking.time}</p>
                    </div>
                    
                    <p>📞 <strong>What can you do?</strong></p>
                    <p>Please call us at the clinic to find an alternative time, or visit our website to request a different slot.</p>
                    
                    <p style="margin-top:28px; color:#777;">Warm regards,<br><strong style="color:#07863f;">Save Dental Clinic Team</strong></p>
                  </div>
                  <div style="background:#f4f4f4; padding:12px; text-align:center; font-size:12px; color:#999; border-radius:0 0 8px 8px;">
                    Save Dental Clinic, Ibadan | This is an automated message.
                  </div>
                </div>
              `
            };
            const info = await transporter.sendMail(mailOptions);
            console.log(`${status} Email Sent to:`, booking.email);
          } catch (emailError) {
            console.error('Failed to send patient status update email:', emailError.message);
          }
        }
      });
    }
    
    res.json({ message: 'Status updated' });
  });
});

// --- Patient Routes ---

// Get all patients
app.get('/api/patients', authenticateToken, (req, res) => {
  db.all('SELECT * FROM patients ORDER BY last_name ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create new patient
app.post('/api/patients', authenticateToken, [
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').optional({ checkFalsy: true }).trim()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { first_name, last_name, email, phone, dob, allergies, medications, medical_conditions } = req.body;
  
  db.run(
    `INSERT INTO patients (first_name, last_name, email, phone, dob, allergies, medications, medical_conditions) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [first_name, last_name, email, phone, dob, allergies, medications, medical_conditions],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Patient created successfully', id: this.lastID });
    }
  );
});

// Get patient by ID
app.get('/api/patients/:id', authenticateToken, (req, res) => {
  db.get('SELECT * FROM patients WHERE id = ?', [req.params.id], (err, patient) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  });
});

// Update patient
app.patch('/api/patients/:id', authenticateToken, [
  body('first_name').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('last_name').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional({ checkFalsy: true }).isEmail().normalizeEmail(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { first_name, last_name, email, phone, dob, allergies, medications, medical_conditions } = req.body;
  db.run(
    `UPDATE patients SET
      first_name = COALESCE(?, first_name),
      last_name  = COALESCE(?, last_name),
      email      = COALESCE(?, email),
      phone      = COALESCE(?, phone),
      dob        = COALESCE(?, dob),
      allergies  = COALESCE(?, allergies),
      medications = COALESCE(?, medications),
      medical_conditions = COALESCE(?, medical_conditions)
    WHERE id = ?`,
    [first_name, last_name, email, phone, dob, allergies, medications, medical_conditions, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Patient not found' });
      res.json({ message: 'Patient updated successfully' });
    }
  );
});

// Delete patient
app.delete('/api/patients/:id', authenticateToken, authorizeRole(['admin', 'dentist']), (req, res) => {
  db.run('DELETE FROM dental_charts WHERE patient_id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    db.run('DELETE FROM patients WHERE id = ?', [req.params.id], function(err2) {
      if (err2) return res.status(500).json({ error: err2.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Patient not found' });
      res.json({ message: 'Patient deleted successfully' });
    });
  });
});

// --- Dental Chart Routes ---

// Get charts for a patient
app.get('/api/patients/:patient_id/charts', authenticateToken, (req, res) => {
  db.all('SELECT * FROM dental_charts WHERE patient_id = ?', [req.params.patient_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create or update chart entry
app.post('/api/patients/:patient_id/charts', authenticateToken, authorizeRole(['admin', 'dentist']), (req, res) => {
  const { tooth_number, condition, treatment, notes } = req.body;
  const { patient_id } = req.params;
  
  db.run(
    `INSERT INTO dental_charts (patient_id, tooth_number, condition, treatment, notes) VALUES (?, ?, ?, ?, ?)`,
    [patient_id, tooth_number, condition, treatment, notes],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Chart updated successfully', id: this.lastID });
    }
  );
});

// --- User Management Routes (Admin Only) ---

// GET all users
app.get('/api/users', authenticateToken, authorizeRole(['admin']), (req, res) => {
  db.all('SELECT id, name, email, role FROM users ORDER BY id ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST create user
app.post('/api/users', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'All fields (email, password, role) are required' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name || null, email, hash, role],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'A user with this email already exists' });
          }
          return res.status(400).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, name, email, role });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE user
app.delete('/api/users/:id', authenticateToken, authorizeRole(['admin']), (req, res) => {
  const userIdToDelete = parseInt(req.params.id);
  if (req.user && req.user.id === userIdToDelete) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }
  
  db.run('DELETE FROM users WHERE id = ?', [userIdToDelete], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  });
});

// POST change password for logged-in user
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Old and new passwords are required' });
  }

  db.get('SELECT * FROM users WHERE id = ?', [req.user.id], async (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(oldPassword, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Incorrect old password' });
    }

    try {
      const hash = await bcrypt.hash(newPassword, 10);
      db.run('UPDATE users SET password = ? WHERE id = ?', [hash, req.user.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Password changed successfully' });
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
});

// POST admin reset password for another user
app.post('/api/users/:id/reset-password', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  const { newPassword } = req.body;
  const targetId = parseInt(req.params.id);
  if (!newPassword) {
    return res.status(400).json({ error: 'New password is required' });
  }

  try {
    const hash = await bcrypt.hash(newPassword, 10);
    db.run('UPDATE users SET password = ? WHERE id = ?', [hash, targetId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
      res.json({ message: 'User password reset successfully' });
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST forgot password (public recovery)
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  db.get('SELECT id, name, email FROM users WHERE email = ?', [email.trim().toLowerCase()], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) {
      // Return 200 to prevent user enumeration, but state the email outcome generically or specifically
      return res.status(404).json({ error: 'No user account found with that email address' });
    }

    // Generate a secure temporary password
    const tempPassword = 'SD-' + Math.floor(100000 + Math.random() * 900000);

    try {
      const hash = await bcrypt.hash(tempPassword, 10);
      db.run('UPDATE users SET password = ? WHERE id = ?', [hash, user.id], async function(err) {
        if (err) return res.status(500).json({ error: err.message });

        // Email the temporary password
        if (transporter) {
          try {
            const senderEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
            await transporter.sendMail({
              from: `"Save Dental Website" <${senderEmail}>`,
              to: user.email,
              subject: '🔑 Save Dental Account Password Recovery',
              attachments: [{
                filename: 'save-dental-profile.jpg',
                path: path.join(__dirname, '../public/images/save-dental-profile.jpg'),
                cid: 'savelogo'
              }],
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                  <div style="text-align: center; margin-bottom: 20px;">
                    <img src="cid:savelogo" alt="Save Dental Clinic Logo" style="height: 60px; border-radius: 50%;" />
                  </div>
                  <h2 style="color:#07863f;">Password Reset Request</h2>
                  <p>Hello ${user.name || 'Staff Member'},</p>
                  <p>You requested to reset your password. We have generated a temporary password for your account:</p>
                  <div style="background:#f4f7f4; padding:15px; border-radius:6px; font-size:1.3rem; font-weight:bold; letter-spacing:1px; text-align:center; color:#07863f; margin: 20px 0;">
                    ${tempPassword}
                  </div>
                  <p style="color:#ef4444; font-weight:600;">Important Security Note:</p>
                  <p>Please log in immediately using this temporary password and change it to a secure password in the dashboard settings.</p>
                  <br>
                  <p>Best regards,<br>Save Dental Clinic Team</p>
                </div>
              `
            });
            return res.json({ message: 'Temporary password has been sent to your email.' });
          } catch (e) {
            console.error('Failed to send forgot password email:', e);
            return res.status(500).json({ error: 'Failed to send recovery email. Please try again later.' });
          }
        } else {
          return res.status(500).json({ error: 'Mail service is not configured. Please contact the main administrator.' });
        }
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
});


// --- Reviews Routes ---
app.post('/api/reviews', [
  body('name').trim().notEmpty().escape(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').trim().notEmpty().escape()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
  const { name, rating, comment } = req.body;
  db.run('INSERT INTO reviews (name, rating, comment) VALUES (?, ?, ?)', [name, rating, comment], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Review submitted successfully, pending approval.', id: this.lastID });
  });
});

app.get('/api/reviews', (req, res) => {
  db.all('SELECT * FROM reviews WHERE is_approved = 1 ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/admin/reviews', authenticateToken, (req, res) => {
  db.all('SELECT * FROM reviews ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.patch('/api/reviews/:id', authenticateToken, (req, res) => {
  const { is_approved } = req.body;
  db.run('UPDATE reviews SET is_approved = ? WHERE id = ?', [is_approved ? 1 : 0, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Review updated' });
  });
});

app.delete('/api/reviews/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM reviews WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Review deleted' });
  });
});

// --- Gallery Routes ---
app.get('/api/gallery', (req, res) => {
  db.all('SELECT * FROM gallery ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/gallery', authenticateToken, upload.fields([{ name: 'before', maxCount: 1 }, { name: 'after', maxCount: 1 }]), (req, res) => {
  const { title, description } = req.body;
  if (!title || !req.files['before'] || !req.files['after']) {
    return res.status(400).json({ error: 'Title and both images are required' });
  }
  
  const before_url = '/uploads/' + req.files['before'][0].filename;
  const after_url = '/uploads/' + req.files['after'][0].filename;
  
  db.run('INSERT INTO gallery (title, before_url, after_url, description) VALUES (?, ?, ?, ?)', [title, before_url, after_url, description || null], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Gallery item added', id: this.lastID, before_url, after_url });
  });
});

app.delete('/api/gallery/:id', authenticateToken, (req, res) => {
  db.get('SELECT * FROM gallery WHERE id = ?', [req.params.id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Not found' });
    
    // Attempt to delete files
    try {
      fs.unlinkSync(path.join(__dirname, row.before_url));
      fs.unlinkSync(path.join(__dirname, row.after_url));
    } catch (e) {
      console.warn("Could not delete image files:", e.message);
    }
    
    db.run('DELETE FROM gallery WHERE id = ?', [req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Gallery item deleted' });
    });
  });
});

// --- Site Settings Routes ---
app.get('/api/settings', (req, res) => {
  db.all('SELECT key, value FROM settings', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const obj = {};
    rows.forEach(r => {
      try { obj[r.key] = JSON.parse(r.value); } catch { obj[r.key] = r.value; }
    });
    res.json(obj);
  });
});

app.put('/api/settings', authenticateToken, (req, res) => {
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
