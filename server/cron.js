import cron from 'node-cron';
import db from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function startCronJobs(transporter) {
  // ─── 7:30 AM: Admin daily summary ───────────────────────────────────────
  cron.schedule('30 7 * * *', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    db.all(
      `SELECT * FROM appointments WHERE date = ? AND status IN ('Confirmed', 'Pending') ORDER BY time ASC`,
      [tomorrowStr],
      async (err, bookings) => {
        if (err || !bookings || bookings.length === 0 || !transporter) return;

        const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
        const senderEmail = process.env.SMTP_USER;
        if (!adminEmail) return;

        const rows = bookings.map(b => `
          <tr style="border-bottom:1px solid #e5e5e5;">
            <td style="padding:10px 8px;">${b.name}</td>
            <td style="padding:10px 8px;">${b.service}</td>
            <td style="padding:10px 8px;">${b.time}</td>
            <td style="padding:10px 8px;">
              <span style="background:${b.status === 'Confirmed' ? '#dcfce7' : '#fef9c3'};color:${b.status === 'Confirmed' ? '#166534' : '#854d0e'};padding:2px 10px;border-radius:20px;font-size:0.8rem;font-weight:700;">
                ${b.status}
              </span>
            </td>
          </tr>
        `).join('');

        try {
          await transporter.sendMail({
            from: `"Save Dental System" <${senderEmail}>`,
            to: adminEmail,
            subject: `📋 Tomorrow's Schedule — ${bookings.length} appointment${bookings.length !== 1 ? 's' : ''} (${tomorrowStr})`,
            attachments: [{
              filename: 'save-dental-profile.jpg',
              path: path.join(__dirname, '../public/images/save-dental-profile.jpg'),
              cid: 'savelogo'
            }],
            html: `
              <div style="font-family:sans-serif;max-width:680px;margin:0 auto;">
                <div style="background:#07863f;padding:22px 28px;border-radius:8px 8px 0 0;text-align:center;">
                  <img src="cid:savelogo" alt="Save Dental Clinic Logo" style="height: 50px; border-radius: 50%; border: 2px solid white; vertical-align: middle; margin-right: 10px;" />
                  <h2 style="color:white;margin:0;display:inline-block;vertical-align:middle;">Tomorrow's Clinic Schedule</h2>
                  <p style="color:#c8f5d8;margin:6px 0 0;">${tomorrowStr} — ${bookings.length} appointment${bookings.length !== 1 ? 's' : ''}</p>
                </div>
                <div style="background:#fff;border:1px solid #e5e5e5;padding:0 0 20px;">
                  <table style="width:100%;border-collapse:collapse;">
                    <thead>
                      <tr style="background:#f0fdf4;">
                        <th style="padding:12px 8px;text-align:left;font-size:0.82rem;color:#6b7280;text-transform:uppercase;">Patient</th>
                        <th style="padding:12px 8px;text-align:left;font-size:0.82rem;color:#6b7280;text-transform:uppercase;">Service</th>
                        <th style="padding:12px 8px;text-align:left;font-size:0.82rem;color:#6b7280;text-transform:uppercase;">Time</th>
                        <th style="padding:12px 8px;text-align:left;font-size:0.82rem;color:#6b7280;text-transform:uppercase;">Status</th>
                      </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                  </table>
                </div>
                <div style="padding:16px 24px;background:#f9f9f9;border:1px solid #e5e5e5;border-top:0;border-radius:0 0 8px 8px;font-size:0.82rem;color:#999;">
                  This is an automated daily summary from Save Dental Clinic system.
                </div>
              </div>
            `
          });
          console.log(`Admin daily summary sent to ${adminEmail}`);
        } catch (e) {
          console.error('Failed to send admin daily summary:', e.message);
        }
      }
    );
  });

  // ─── 8:00 AM: Patient reminder emails ────────────────────────────────────
  cron.schedule('0 8 * * *', () => {
    console.log('Running daily appointment reminder job at 8:00 AM');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    db.all(
      'SELECT * FROM appointments WHERE date = ? AND status = ?',
      [tomorrowStr, 'Confirmed'],
      (err, bookings) => {
        if (err) {
          console.error('Error fetching appointments for reminders:', err);
          return;
        }

        if (!bookings || bookings.length === 0) {
          console.log('No confirmed appointments found for tomorrow.');
          return;
        }

        console.log(`Found ${bookings.length} appointments for tomorrow. Sending reminders...`);

        bookings.forEach(async (booking) => {
          if (!transporter || !booking.email) return;

          try {
            const senderEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'noreply@savedental.com';
            await transporter.sendMail({
              from: `"Save Dental Clinic" <${senderEmail}>`,
              to: booking.email,
              subject: `⏰ Reminder: Your appointment is tomorrow — Save Dental Clinic`,
              attachments: [{
                filename: 'save-dental-profile.jpg',
                path: path.join(__dirname, '../public/images/save-dental-profile.jpg'),
                cid: 'savelogo'
              }],
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background:#07863f; padding:24px; border-radius:8px 8px 0 0; text-align:center;">
                    <img src="cid:savelogo" alt="Save Dental Clinic Logo" style="height: 60px; border-radius: 50%; border: 2px solid white; margin-bottom: 10px;" />
                    <h2 style="color:white; margin:0;">Appointment Reminder</h2>
                    <p style="color:#c8f5d8; margin:4px 0 0;">Save Dental Clinic</p>
                  </div>
                  <div style="padding:24px; background:#fff; border:1px solid #e5e5e5;">
                    <h3 style="color:#07863f;">Hello ${booking.name},</h3>
                    <p>This is a friendly reminder that you have a confirmed appointment with us <strong>tomorrow</strong>!</p>
                    <div style="background:#f0fdf4; border-left:4px solid #07863f; padding:16px; margin:20px 0; border-radius:4px;">
                      <h4 style="margin:0 0 12px; color:#07863f;">Your Appointment Details</h4>
                      <p style="margin:6px 0;"><strong>Service:</strong> ${booking.service}</p>
                      <p style="margin:6px 0;"><strong>Date:</strong> ${booking.date}</p>
                      <p style="margin:6px 0;"><strong>Time:</strong> ${booking.time}</p>
                    </div>
                    <p>⏰ <strong>Please arrive 10 minutes early</strong> to complete any paperwork.</p>
                    <p>📍 <strong>Location:</strong> Dikat House, First Floor, A1 No. 60 Ring Road, Ibadan, Oyo State.</p>
                    <p>If you need to reschedule or cancel, please call us as soon as possible.</p>
                    <p style="margin-top:28px; color:#777;">See you tomorrow,<br><strong style="color:#07863f;">Save Dental Clinic Team</strong></p>
                  </div>
                  <div style="background:#f4f4f4; padding:12px; text-align:center; font-size:12px; color:#999; border-radius:0 0 8px 8px;">
                    Save Dental Clinic, Ibadan | This is an automated reminder.
                  </div>
                </div>
              `
            });
            console.log(`Reminder sent to ${booking.email}`);
          } catch (error) {
            console.error(`Failed to send reminder to ${booking.email}:`, error);
          }
        });
      }
    );
  });

  console.log('Cron jobs scheduled: 7:30 AM admin summary + 8:00 AM patient reminders.');
}
