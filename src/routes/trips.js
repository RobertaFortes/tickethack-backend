var express = require('express');
var router = express.Router();
const { getTrips } = require('../controllers/tripsController');

router.get('/', getTrips);

module.exports = router;
