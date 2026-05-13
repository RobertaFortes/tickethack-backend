const Trip = require('../models/trips');

exports.getTrips = async (req, res) => {
  try {
    const { departure, arrival } = req.query;
    const filter = {};
    if (departure) filter.departure = new RegExp(departure, 'i');
    if (arrival) filter.arrival = new RegExp(arrival, 'i');

    const trips = await Trip.find(filter);
    res.json({ result: true, trips });
  } catch (error) {
    res.status(500).json({ result: false, error: 'Internal server error' });
  }
};
