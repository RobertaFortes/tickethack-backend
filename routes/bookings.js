var express = require('express');
var router = express.Router();

const Booking = require('../models/bookings');
const Trip = require('../models/trips');

router.post('/', async (req, res) => {
  try {
    const { tripId } = req.body;

    if (!tripId) {
      return res.status(400).json({ result: false, error: 'tripId is required' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ result: false, error: 'Trip not found' });
    }

    const booking = await Booking.create({
      trip: trip._id,
      totalPrice: trip.price,
    });

    res.status(201).json({ result: true, booking });
  } catch (error) {
    res.status(500).json({ result: false, error: 'Internal server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().populate('trip');
    res.json({ result: true, bookings });
  } catch (error) {
    res.status(500).json({ result: false, error: 'Internal server error' });
  }
});

module.exports = router;
