const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'trips' },
  status: { type: String, enum: ['pending', 'confirmed'], default: 'pending' },
  totalPrice: Number,
  createdAt: { type: Date, default: Date.now },
  purchasedAt: Date,
});

const Booking = mongoose.model('bookings', bookingSchema);

module.exports = Booking;