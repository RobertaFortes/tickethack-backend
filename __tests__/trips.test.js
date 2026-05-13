const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Trip = require('../src/models/trips');

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

describe('POST /bookings', () => {
  it('should return 400 if tripId is missing', async () => {
    const res = await request(app).post('/bookings').send({});
    expect(res.status).toBe(400);
    expect(res.body.result).toBe(false);
  });

  it('should return 404 if trip not found', async () => {
    const res = await request(app).post('/bookings').send({ tripId: '000000000000000000000000' });
    expect(res.status).toBe(404);
    expect(res.body.result).toBe(false);
  });

  it('should create booking and return booking object', async () => {
    const trip = await Trip.findOne({ departure: 'Paris', arrival: 'Lyon' });
    const res = await request(app).post('/bookings').send({ tripId: trip._id });
    expect(res.status).toBe(201);
    expect(res.body.result).toBe(true);
    expect(res.body.booking).toBeDefined();
    expect(res.body.booking.totalPrice).toBe(100);
  });
});

describe('GET /bookings', () => {
  it('should return all bookings', async () => {
    const res = await request(app).get('/bookings');
    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(Array.isArray(res.body.bookings)).toBe(true);
  });

  it('should return bookings with trip populated', async () => {
    const res = await request(app).get('/bookings');
    expect(res.status).toBe(200);
    res.body.bookings.forEach(booking => {
      expect(booking.trip).toHaveProperty('departure');
      expect(booking.trip).toHaveProperty('arrival');
      expect(booking.trip).toHaveProperty('price');
    });
  });
});

describe('DELETE /bookings/:id', () => {
  it('should delete a booking and return result true', async () => {
    const trip = await Trip.findOne({ departure: 'Lyon' });
    const postRes = await request(app).post('/bookings').send({ tripId: trip._id });
    const bookingId = postRes.body.booking._id;

    const res = await request(app).delete(`/bookings/${bookingId}`);
    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
  });

  it('should return 404 for unknown booking id', async () => {
    const res = await request(app).delete('/bookings/000000000000000000000000');
    expect(res.status).toBe(404);
    expect(res.body.result).toBe(false);
  });
});

