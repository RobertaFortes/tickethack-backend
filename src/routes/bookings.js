var express = require('express');
var router = express.Router();
const { createBooking, getBookingsByToken } = require('../controllers/bookingsController');

router.post('/', createBooking);
router.get('/:token', getBookingsByToken);

module.exports = router;
