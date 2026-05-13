const Trip = require('../models/trips');
const Booking = require('../models/bookings');

exports.createBooking = async (req, res) => {
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

    res.status(201).json({ result: true, token: booking.token, booking });
  } catch (error) {
    res.status(500).json({ result: false, error: 'Internal server error' });
  }
};

exports.getBookingsByToken = async (req, res) => {
  try {
    const bookings = await Booking.find({ token: req.params.token }).populate('trip');
    res.json({ result: true, bookings });
  } catch (error) {
    res.status(500).json({ result: false, error: 'Internal server error' });
  }
};
