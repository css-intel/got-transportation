const express = require('express');
const Stripe = require('stripe');
const config = require('../config');
const { Booking, MvpPayment } = require('../models');
const { authenticate } = require('../middleware/auth');

const stripe = new Stripe(config.stripe.secretKey);
const router = express.Router();

// Create payment intent for booking
router.post('/create-payment-intent', authenticate, async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ error: 'Booking ID required.' });
    }

    const booking = await Booking.findOne({
      where: { id: bookingId, userId: req.user.id },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Booking already paid.' });
    }

    const amountInCents = Math.round(parseFloat(booking.fare) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        bookingId: booking.id,
        userId: req.user.id,
        type: 'ride_booking',
      },
    });

    await booking.update({ stripePaymentIntentId: paymentIntent.id });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: amountInCents,
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment.' });
  }
});

// Create MVP payment checkout session
router.post('/mvp-checkout', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'MVP Development Fee - G.O.T Transportation',
            description: 'MVP approval deposit (50%) for full development and deployment',
          },
          unit_amount: config.stripe.mvpPaymentAmount, // $1,250 in cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${config.frontendUrl}/mvp-payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.frontendUrl}/mvp-payment-cancelled`,
      metadata: {
        type: 'mvp_payment',
      },
    });

    // Record the pending payment
    await MvpPayment.create({
      stripeSessionId: session.id,
      amount: config.stripe.mvpPaymentAmount,
      status: 'pending',
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('MVP checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session.' });
  }
});

// Check MVP payment status
router.get('/mvp-status', async (req, res) => {
  try {
    const payment = await MvpPayment.findOne({
      where: { status: 'completed' },
      order: [['createdAt', 'DESC']],
    });

    res.json({ paid: !!payment, payment: payment || null });
  } catch (error) {
    console.error('MVP status error:', error);
    res.status(500).json({ error: 'Failed to check MVP status.' });
  }
});

// Verify MVP checkout session
router.get('/mvp-verify/:sessionId', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);

    if (session.payment_status === 'paid') {
      await MvpPayment.update(
        {
          status: 'completed',
          stripePaymentIntentId: session.payment_intent,
          paidAt: new Date(),
        },
        { where: { stripeSessionId: session.id } }
      );
      return res.json({ paid: true });
    }

    res.json({ paid: false });
  } catch (error) {
    console.error('MVP verify error:', error);
    res.status(500).json({ error: 'Failed to verify payment.' });
  }
});

module.exports = router;
