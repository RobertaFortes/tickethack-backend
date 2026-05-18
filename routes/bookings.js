var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');

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
      status: 'pending',
      totalPrice: trip.price,
    });

    res.status(201).json({ result: true, booking });
  } catch (error) {
    res.status(500).json({ result: false, error: 'Internal server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const bookings = await Booking.find(filter).populate('trip');
    res.json({ result: true, bookings });
  } catch (error) {
    res.status(500).json({ result: false, error: 'Internal server error' });
  }
});

router.patch('/purchase', async (req, res) => {
  try {
    const { bookingIds } = req.body;

    if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
      return res.status(400).json({ result: false, error: 'bookingIds is required' });
    }

    const purchasedAt = new Date();

    await Booking.updateMany(
      { _id: { $in: bookingIds } },
      { status: 'confirmed', purchasedAt }
    );

    const bookings = await Booking.find({ _id: { $in: bookingIds } }).populate('trip');

    res.json({ result: true, bookings });
  } catch (error) {
    res.status(500).json({ result: false, error: 'Internal server error' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ result: false, error: 'status is required' });
    }

    if (!['pending', 'confirmed'].includes(status)) {
      return res.status(400).json({ result: false, error: 'Invalid status' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ result: false, error: 'Booking not found' });
    }

    const update = { status };

    if (status === 'confirmed') {
      update.purchasedAt = new Date();
    } else {
      update.purchasedAt = null;
    }

    const booking = await Booking.findByIdAndUpdate(req.params.id, update, { new: true }).populate('trip');

    if (!booking) {
      return res.status(404).json({ result: false, error: 'Booking not found' });
    }

    res.json({ result: true, booking });
  } catch (error) {
    res.status(500).json({ result: false, error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id);

    if (!deletedBooking) {
      return res.status(404).json({ result: false, error: 'Booking not found' });
    }

    res.json({ result: true });
  } catch (error) {
    res.status(500).json({ result: false, error: 'Internal server error' });
  }
});

module.exports = router;
