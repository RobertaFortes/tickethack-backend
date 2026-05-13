var express = require('express');
var router = express.Router();
const Trip = require('../models/trips');

router.get('/', async (req, res) => {
	try {
		const { departure, arrival, date } = req.query;
		const filter = {};

		if (departure) filter.departure = new RegExp(departure, 'i');
		if (arrival) filter.arrival = new RegExp(arrival, 'i');

		if (date) {
			const start = new Date(date);
			start.setHours(0, 0, 0, 0);
			const end = new Date(date);
			end.setHours(23, 59, 59, 999);
			filter.date = { $gte: start, $lte: end };
		}

		const trips = await Trip.find(filter);
		res.json({ result: true, trips });
	} catch (error) {
		res.status(500).json({ result: false, error: 'Internal server error' });
	}
});

module.exports = router;
