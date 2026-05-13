var express = require('express');
var router = express.Router();
const { createBooking, getBookings, deleteBooking } = require('../controllers/bookingsController');

router.post('/', createBooking);
router.get('/', getBookings);
router.delete('/:id', deleteBooking);

module.exports = router;
