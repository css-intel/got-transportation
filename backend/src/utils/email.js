const nodemailer = require('nodemailer');
const config = require('../config');

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: false,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

const sendBookingConfirmation = async (user, booking) => {
  try {
    const serviceLabel = booking.serviceType === 'medical_courier'
      ? 'Medical Courier' : 'Personal Transportation';
    const scheduleText = booking.isAsap
      ? 'ASAP' : new Date(booking.scheduledAt).toLocaleString();

    await transporter.sendMail({
      from: `"G.O.T Transportation" <${config.smtp.user}>`,
      to: user.email,
      subject: 'Booking Confirmation - G.O.T Transportation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #1a1a2e; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #4a90d9; margin: 0;">G.O.T Transportation</h1>
            <p style="color: #ccc; margin: 5px 0 0;">Nita Jr. Get On Through</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333;">Booking Confirmed!</h2>
            <p>Hi ${user.name},</p>
            <p>Your ride has been booked successfully.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Service</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${serviceLabel}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Pickup</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.pickupAddress}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Dropoff</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.dropoffAddress}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Schedule</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${scheduleText}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Distance</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.distanceMiles} miles</td></tr>
              <tr><td style="padding: 8px; font-weight: bold; font-size: 18px;">Total Fare</td><td style="padding: 8px; font-size: 18px; color: #4a90d9;">$${parseFloat(booking.fare).toFixed(2)}</td></tr>
            </table>
            <p style="color: #666; font-size: 14px;">Thank you for choosing G.O.T Transportation!</p>
          </div>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error.message);
    return false;
  }
};

module.exports = { sendBookingConfirmation };
