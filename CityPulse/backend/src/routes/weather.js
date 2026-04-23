const express = require('express');
const router = express.Router();
const { getWeather } = require('../services/weatherService');

// GET /api/weather/:city
router.get('/:city', async (req, res) => {
  try {
    const { city } = req.params;

    if (!city || city.trim().length === 0) {
      return res.status(400).json({ error: 'City name is required' });
    }

    const data = await getWeather(city.trim());
    res.json(data);
  } catch (err) {
    console.error(`[Weather] Error fetching data for "${req.params.city}":`, err.message);

    if (err.response && err.response.status === 404) {
      return res.status(404).json({ error: 'City not found' });
    }

    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

module.exports = router;
