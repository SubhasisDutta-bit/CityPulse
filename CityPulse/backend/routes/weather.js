import express from 'express';
import { getWeatherByCity } from '../services/weatherService.js';

const router = express.Router();

router.get('/:city', async (req, res) => {
  try {
    const { city } = req.params;

    if (!city || city.trim() === '') {
      return res.status(400).json({ error: 'City name is required' });
    }

    const weather = await getWeatherByCity(city);
    res.json(weather);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
