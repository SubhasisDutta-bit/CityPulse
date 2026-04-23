const express = require('express');
const router = express.Router();
const { getNews } = require('../services/newsService');

router.get('/:city', async (req, res) => {
  try {
    const city = req.params.city;
    if (!city) {
      return res.status(400).json({ error: 'City parameter is required.' });
    }

    const data = await getNews(city);
    res.json(data);
  } catch (error) {
    console.error('News Route Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch News data.' });
  }
});

module.exports = router;
