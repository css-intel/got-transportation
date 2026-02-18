const express = require('express');
const { Op } = require('sequelize');
const { Booking, User, MvpPayment } = require('../models');
const { authenticate, requireAdmin, checkMvpPayment } = require('../middleware/auth');

const router = express.Router();

// All admin routes require auth + admin role
router.use(authenticate, requireAdmin);

// Get all bookings (admin)
router.get('/bookings', checkMvpPayment, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows: bookings } = await Booking.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      bookings,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
      mvpPaid: req.mvpPaid,
    });
  } catch (error) {
    console.error('Admin bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings.' });
  }
});

// Update booking status (admin)
router.patch('/bookings/:id/status', checkMvpPayment, async (req, res) => {
  try {
    if (!req.mvpPaid) {
      return res.status(403).json({
        error: 'Demo mode: Cannot modify bookings until MVP payment is completed.',
        demoMode: true,
      });
    }

    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const booking = await Booking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    await booking.update({ status });
    res.json({ message: 'Status updated', booking });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Failed to update status.' });
  }
});

// Get all customers (admin)
router.get('/customers', checkMvpPayment, async (req, res) => {
  try {
    const customers = await User.findAll({
      where: { role: 'customer' },
      attributes: ['id', 'name', 'email', 'phone', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    res.json({ customers, mvpPaid: req.mvpPaid });
  } catch (error) {
    console.error('Admin customers error:', error);
    res.status(500).json({ error: 'Failed to fetch customers.' });
  }
});

// Revenue summary (admin)
router.get('/revenue', checkMvpPayment, async (req, res) => {
  try {
    const totalBookings = await Booking.count();
    const completedBookings = await Booking.count({ where: { status: 'completed' } });
    const pendingBookings = await Booking.count({ where: { status: 'pending' } });
    const confirmedBookings = await Booking.count({ where: { status: 'confirmed' } });
    const cancelledBookings = await Booking.count({ where: { status: 'cancelled' } });

    const totalRevenue = await Booking.sum('fare', {
      where: { paymentStatus: 'paid' },
    }) || 0;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayRevenue = await Booking.sum('fare', {
      where: {
        paymentStatus: 'paid',
        createdAt: { [Op.gte]: todayStart },
      },
    }) || 0;

    const totalCustomers = await User.count({ where: { role: 'customer' } });

    res.json({
      totalBookings,
      completedBookings,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      totalRevenue: parseFloat(totalRevenue),
      todayRevenue: parseFloat(todayRevenue),
      totalCustomers,
      mvpPaid: req.mvpPaid,
    });
  } catch (error) {
    console.error('Revenue summary error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue data.' });
  }
});

module.exports = router;
