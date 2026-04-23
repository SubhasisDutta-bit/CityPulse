const express = require('express');
const router = express.Router();
const { getAQI } = require('../services/aqiService');

router.get('/:city', async (req, res) => {
  try {
    const city = req.params.city;
    if (!city) {
      return res.status(400).json({ error: 'City parameter is required.' });
    }

    const data = await getAQI(city);
    res.json(data);
  } catch (error) {
    if (error.message === 'City not found') {
      return res.status(404).json({ error: 'City not found.' });
    }
    console.error('AQI Route Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch AQI data.' });
  }
});

module.exports = router;
