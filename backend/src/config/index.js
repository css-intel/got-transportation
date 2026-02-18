require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    mvpPaymentAmount: parseInt(process.env.MVP_PAYMENT_AMOUNT || '125000', 10),
  },
  google: {
    mapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@gottransportation.com',
    password: process.env.ADMIN_PASSWORD || 'AdminSecure123!',
  },
};
