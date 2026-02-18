const express = require('express');
const Stripe = require('stripe');
const config = require('../config');
const { Booking, MvpPayment } = require('../models');

const stripe = new Stripe(config.stripe.secretKey);
const router = express.Router();

// Stripe webhook handler - uses raw body
router.post('/', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, config.stripe.webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;

        if (paymentIntent.metadata.type === 'ride_booking') {
          await Booking.update(
            { paymentStatus: 'paid', status: 'confirmed' },
            { where: { stripePaymentIntentId: paymentIntent.id } }
          );
          console.log(`Booking payment confirmed: ${paymentIntent.id}`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;

        if (paymentIntent.metadata.type === 'ride_booking') {
          await Booking.update(
            { paymentStatus: 'failed' },
            { where: { stripePaymentIntentId: paymentIntent.id } }
          );
          console.log(`Booking payment failed: ${paymentIntent.id}`);
        }
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object;

        if (session.metadata.type === 'mvp_payment') {
          await MvpPayment.update(
            {
              status: 'completed',
              stripePaymentIntentId: session.payment_intent,
              paidAt: new Date(),
            },
            { where: { stripeSessionId: session.id } }
          );
          console.log(`MVP payment completed: ${session.id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed.' });
  }
});

module.exports = router;
