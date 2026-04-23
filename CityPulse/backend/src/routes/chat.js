const express = require('express');
const router = express.Router();
const { getIntelligence } = require('../services/intelligenceService');
const { processQuery } = require('../services/chatbotService');

router.post('/', async (req, res) => {
  try {
    const { city, query } = req.body;

    if (!city || !query) {
      return res.status(400).json({ error: 'Both city and query parameters are required.' });
    }

    // 1. Resolve Intelligence Aggregate
    const intelligenceData = await getIntelligence(city);

    // 2. Compute the query directly natively
    const reply = processQuery(query, intelligenceData);

    res.json(reply);
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: 'Intelligence processing failed or city unreachable.' });
  }
});

module.exports = router;
