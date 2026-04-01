const express = require('express');
const cors = require('cors');

const app = express();

// CORS 
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/hotels', require('./routes/hotel.routes'));
app.use('/api/airports', require('./routes/airport.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/amenities', require('./routes/amenity.routes'));
app.use('/api/requests', require('./routes/request.routes'));
app.use('/api/ratings', require('./routes/rating.routes'));


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;