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

  it('should create booking and return token', async () => {
    const trip = await Trip.findOne({ departure: 'Paris', arrival: 'Lyon' });
    const res = await request(app).post('/bookings').send({ tripId: trip._id });
    expect(res.status).toBe(201);
    expect(res.body.result).toBe(true);
    expect(res.body.token).toBeDefined();
  });
});

describe('GET /bookings/:token', () => {
  it('should return empty array for unknown token', async () => {
    const res = await request(app).get('/bookings/unknown-token');
    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.bookings).toHaveLength(0);
  });

  it('should return booking for valid token', async () => {
    const trip = await Trip.findOne({ departure: 'Lyon' });
    const postRes = await request(app).post('/bookings').send({ tripId: trip._id });
    const token = postRes.body.token;

    const res = await request(app).get(`/bookings/${token}`);
    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.bookings.length).toBe(1);
    expect(res.body.bookings[0].trip.departure).toBe('Lyon');
  });
});

