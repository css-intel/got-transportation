const express = require('express');
const { body, validationResult } = require('express-validator');
const { Booking, User } = require('../models');
const { authenticate } = require('../middleware/auth');
const { calculateFare } = require('../utils/fareCalculator');
const { sendBookingConfirmation } = require('../utils/email');
const config = require('../config');

const router = express.Router();

// Calculate fare estimate (no auth required for quote)
router.post('/estimate', [
  body('distanceMiles').isFloat({ min: 0.1 }).withMessage('Distance must be > 0'),
  body('serviceType').isIn(['personal_transportation', 'medical_courier']).withMessage('Invalid service type'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { distanceMiles, serviceType } = req.body;
    const fare = calculateFare(distanceMiles, serviceType);

    res.json({
      distanceMiles,
      serviceType,
      baseFare: 8.00,
      perMileRate: 2.50,
      mileageCost: Math.round(distanceMiles * 2.50 * 100) / 100,
      medicalSurcharge: serviceType === 'medical_courier' ? 10.00 : 0,
      totalFare: fare,
    });
  } catch (error) {
    console.error('Fare estimate error:', error);
    res.status(500).json({ error: 'Failed to calculate fare.' });
  }
});

// Get distance from Google Maps Distance Matrix
router.post('/distance', async (req, res) => {
  try {
    const { origin, destination } = req.body;
    if (!origin || !destination) {
      return res.status(400).json({ error: 'Origin and destination required.' });
    }

    const apiKey = config.google.mapsApiKey;
    if (!apiKey || apiKey === 'your_google_maps_api_key') {
      // Fallback: estimate distance based on a random reasonable value for demo
      const estimatedMiles = (Math.random() * 15 + 2).toFixed(1);
      return res.json({
        distanceMiles: parseFloat(estimatedMiles),
        distanceText: `${estimatedMiles} mi`,
        durationText: `${Math.round(estimatedMiles * 2.5)} mins`,
        isEstimate: true,
      });
    }

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&units=imperial&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.rows[0]?.elements[0]?.distance) {
      return res.status(400).json({ error: 'Could not calculate distance.' });
    }

    const element = data.rows[0].elements[0];
    const distanceMeters = element.distance.value;
    const distanceMiles = Math.round((distanceMeters / 1609.34) * 10) / 10;

    res.json({
      distanceMiles,
      distanceText: element.distance.text,
      durationText: element.duration.text,
      isEstimate: false,
    });
  } catch (error) {
    console.error('Distance calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate distance.' });
  }
});

// Create booking
router.post('/', authenticate, [
  body('pickupAddress').trim().notEmpty().withMessage('Pickup address required'),
  body('dropoffAddress').trim().notEmpty().withMessage('Dropoff address required'),
  body('serviceType').isIn(['personal_transportation', 'medical_courier']).withMessage('Invalid service type'),
  body('isAsap').isBoolean().withMessage('isAsap must be boolean'),
  body('scheduledAt').optional({ nullable: true }).isISO8601().withMessage('Invalid date format'),
  body('distanceMiles').isFloat({ min: 0.1 }).withMessage('Distance required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { pickupAddress, dropoffAddress, serviceType, isAsap, scheduledAt, distanceMiles } = req.body;
    const fare = calculateFare(distanceMiles, serviceType);

    const booking = await Booking.create({
      userId: req.user.id,
      pickupAddress,
      dropoffAddress,
      serviceType,
      isAsap,
      scheduledAt: isAsap ? null : scheduledAt,
      distanceMiles,
      fare,
      status: 'pending',
      paymentStatus: 'pending',
    });

    // Send confirmation email (non-blocking)
    sendBookingConfirmation(req.user, booking).catch(console.error);

    res.status(201).json({
      message: 'Booking created successfully',
      booking,
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ error: 'Failed to create booking.' });
  }
});

// Get user's bookings
router.get('/my', authenticate, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json({ bookings });
  } catch (error) {
    console.error('Fetch bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings.' });
  }
});

// Get single booking
router.get('/:id', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] }],
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    res.json({ booking });
  } catch (error) {
    console.error('Fetch booking error:', error);
    res.status(500).json({ error: 'Failed to fetch booking.' });
  }
});

module.exports = router;
