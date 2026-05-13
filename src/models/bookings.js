const mongoose = require('mongoose');
const crypto = require('crypto');

const bookingSchema = mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'trips' },
  token: { type: String, required: true, default: () => crypto.randomUUID() },
  totalPrice: Number,
  purchasedAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model('bookings', bookingSchema);

module.exports = Booking;