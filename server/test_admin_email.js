import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function main() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    const senderEmail = process.env.SMTP_USER;
    const service = "Test Service";
    const name = "Test Name";
    const email = "test@example.com";
    const phone = "1234567890";
    const date = "2026-07-04";
    const time = "10:00 AM";
    const notes = "This is a test note from the developer checking email deliverability.";

    const adminMailOptions = {
      from: `"Save Dental Website" <${senderEmail}>`,
      to: adminEmail,
      subject: `📅 New Booking Request: ${service} for ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background:#07863f; padding:20px; border-radius:8px 8px 0 0;">
            <h2 style="color:white; margin:0;">New Appointment Request</h2>
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
              <tr><td style="padding:8px; font-weight:bold;">Notes:</td><td style="padding:8px;">${notes}</td></tr>
            </table>
            <br>
            <!-- Changed localhost link to an absolute path for testing to see if it bypasses spam filters -->
            <a href="http://localhost:5174/admin" style="padding:12px 24px; background:#07863f; color:white; text-decoration:none; border-radius:6px; display:inline-block;">View Dashboard & Approve</a>
          </div>
        </div>
      `
    };

    console.log('Sending admin email to:', adminEmail);
    const info = await transporter.sendMail(adminMailOptions);
    console.log('Admin Notification Sent Successfully!', info.messageId);
    console.log('Response from SMTP server:', info.response);
  } catch (error) {
    console.error('SMTP Send Error:', error);
  }
}

main();
