const express = require('express');
const cors = require('cors');
require('dotenv').config();

const weatherRoutes = require('./routes/weather');
const aqiRoutes = require('./routes/aqi');
const newsRoutes = require('./routes/news');
const authRoutes = require('./routes/auth');
const savedCitiesRoutes = require('./routes/savedCities');
const chatRoutes = require('./routes/chat');

const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/weather', weatherRoutes);
app.use('/api/aqi', aqiRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/saved-cities', savedCitiesRoutes);
app.use('/api/chat', chatRoutes);

// Database Sync
sequelize.sync({ alter: true }).then(() => {
  console.log('✅ SQLite Database synchronized (altered schema)');
}).catch(err => {
  console.error('❌ Database Sync Error:', err);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`✅ CityPulse Backend running on http://localhost:${PORT}`);
});
