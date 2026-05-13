const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
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

