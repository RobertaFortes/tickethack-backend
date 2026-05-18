const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Booking = require('../models/bookings');
const Trip = require('../models/trips');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.disconnect();
  await mongoose.connect(uri);

  // seed de trips para os testes
  await Trip.create([
    { departure: 'Paris', arrival: 'Lyon', date: new Date(), price: 100 },
    { departure: 'Paris', arrival: 'Marseille', date: new Date(), price: 120 },
    { departure: 'Lyon', arrival: 'Paris', date: new Date(), price: 80 },
  ]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Booking.deleteMany();
});

describe('GET /trips', () => {
  it('should return trips with result true', async () => {
    const res = await request(app).get('/trips');
    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(Array.isArray(res.body.trips)).toBe(true);
  });

  it('should filter by departure', async () => {
    const res = await request(app).get('/trips?departure=Paris');
    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.trips.length).toBe(2);
    res.body.trips.forEach(trip => {
      expect(trip.departure).toBe('Paris');
    });
  });

  it('should filter by departure and arrival', async () => {
    const res = await request(app).get('/trips?departure=Paris&arrival=Lyon');
    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.trips.length).toBe(1);
    expect(res.body.trips[0].arrival).toBe('Lyon');
  });
});

describe('Bookings flow', () => {
  it('should create a pending booking', async () => {
    const trip = await Trip.findOne({ departure: 'Paris', arrival: 'Lyon' });

    const res = await request(app).post('/bookings').send({ tripId: trip._id.toString() });

    expect(res.status).toBe(201);
    expect(res.body.result).toBe(true);
    expect(res.body.booking.status).toBe('pending');
    expect(res.body.booking.totalPrice).toBe(100);
  });

  it('should list only pending bookings', async () => {
    const trip = await Trip.findOne({ departure: 'Paris', arrival: 'Lyon' });
    await Booking.create({ trip: trip._id, status: 'pending', totalPrice: trip.price });
    await Booking.create({ trip: trip._id, status: 'confirmed', totalPrice: trip.price, purchasedAt: new Date() });

    const res = await request(app).get('/bookings?status=pending');

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.bookings.length).toBe(1);
    expect(res.body.bookings[0].status).toBe('pending');
  });

  it('should purchase bookings in batch', async () => {
    const trip = await Trip.findOne({ departure: 'Paris', arrival: 'Lyon' });
    const booking = await Booking.create({ trip: trip._id, status: 'pending', totalPrice: trip.price });

    const res = await request(app)
      .patch('/bookings/purchase')
      .send({ bookingIds: [booking._id.toString()] });

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.bookings[0].status).toBe('confirmed');
    expect(res.body.bookings[0].purchasedAt).toBeTruthy();
  });

  it('should purchase one booking by id', async () => {
    const trip = await Trip.findOne({ departure: 'Paris', arrival: 'Lyon' });
    const booking = await Booking.create({ trip: trip._id, status: 'pending', totalPrice: trip.price });

    const res = await request(app)
      .patch(`/bookings/${booking._id}`)
      .send({ status: 'confirmed' });

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.booking.status).toBe('confirmed');
    expect(res.body.booking.purchasedAt).toBeTruthy();
  });

  it('should delete a booking', async () => {
    const trip = await Trip.findOne({ departure: 'Paris', arrival: 'Lyon' });
    const booking = await Booking.create({ trip: trip._id, status: 'pending', totalPrice: trip.price });

    const res = await request(app).delete(`/bookings/${booking._id}`);

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);

    const deletedBooking = await Booking.findById(booking._id);
    expect(deletedBooking).toBeNull();
  });
});

