const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MvpPayment = sequelize.define('MvpPayment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  stripeSessionId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'stripe_session_id',
  },
  stripePaymentIntentId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'stripe_payment_intent_id',
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 125000, // $1,250 in cents
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending',
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'paid_at',
  },
}, {
  tableName: 'mvp_payments',
  timestamps: true,
});

module.exports = MvpPayment;
