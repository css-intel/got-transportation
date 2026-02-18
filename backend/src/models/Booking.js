const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: { model: 'users', key: 'id' },
  },
  pickupAddress: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'pickup_address',
  },
  dropoffAddress: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'dropoff_address',
  },
  serviceType: {
    type: DataTypes.ENUM('personal_transportation', 'medical_courier'),
    allowNull: false,
    field: 'service_type',
  },
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'scheduled_at',
  },
  isAsap: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_asap',
  },
  distanceMiles: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'distance_miles',
  },
  fare: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
    defaultValue: 'pending',
  },
  stripePaymentIntentId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'stripe_payment_intent_id',
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending',
    field: 'payment_status',
  },
}, {
  tableName: 'bookings',
  timestamps: true,
});

module.exports = Booking;
