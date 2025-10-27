const request = require('supertest');
const express = require('express');
const bookingsRouter = require('../routes/bookings');

// Mock the auth middleware
const auth = (req, res, next) => {
  req.user = { id: 'test-user' };
  next();
};

const app = express();
app.use(express.json());
app.use(auth);
app.use('/bookings', bookingsRouter);

describe('Bookings API', () => {
    it('should create a new booking', async () => {
        const res = await request(app)
            .post('/bookings')
            .send({
                destination: 'Test Destination',
                start_date: '2025-11-01',
                end_date: '2025-11-10',
                telegram_id: 12345
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'Booking created successfully');
    });
});
