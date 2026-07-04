import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './server/.env' });

console.log('Using SMTP Configuration:');
console.log('Host:', process.env.SMTP_HOST);
console.log('Port:', process.env.SMTP_PORT);
console.log('User:', process.env.SMTP_USER);

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
    const info = await transporter.sendMail({
      from: `"Save Dental Test" <${process.env.SMTP_USER}>`,
      to: 'savedental@gmail.com',
      subject: 'SMTP Test Mail',
      text: 'If you receive this, SMTP is working perfectly!',
    });
    console.log('Email sent successfully!', info.messageId);
  } catch (error) {
    console.error('SMTP Send Error:', error);
  }
}

main();
