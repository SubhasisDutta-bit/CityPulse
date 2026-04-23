const express = require('express');
const router = express.Router();
const { SavedCity } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all routes below
router.use(authMiddleware);

// GET /api/saved-cities
router.get('/', async (req, res) => {
  try {
    const cities = await SavedCity.findAll({ 
      where: { userId: req.user.id },
      order: [['isPinned', 'DESC'], ['createdAt', 'DESC']]
    });
    res.status(200).json(cities);
  } catch (err) {
    console.error('Fetch saved cities error:', err);
    res.status(500).json({ error: 'Failed to fetch saved cities.' });
  }
});

// POST /api/saved-cities
router.post('/', async (req, res) => {
  try {
    const { cityName } = req.body;
    if (!cityName) return res.status(400).json({ error: 'City name is required.' });

    const existing = await SavedCity.findOne({ where: { userId: req.user.id, cityName: cityName.toLowerCase() } });
    if (existing) {
      return res.status(400).json({ error: 'City already saved.' });
    }

    const savedCity = await SavedCity.create({ userId: req.user.id, cityName: cityName.toLowerCase() });
    res.status(201).json(savedCity);
  } catch (err) {
    console.error('Save city error:', err);
    res.status(500).json({ error: 'Failed to save city.' });
  }
});

// DELETE /api/saved-cities/:city
router.delete('/:city', async (req, res) => {
  try {
    const deletedCount = await SavedCity.destroy({ 
      where: { userId: req.user.id, cityName: req.params.city.toLowerCase() } 
    });

    if (deletedCount === 0) {
      return res.status(404).json({ error: 'City not found in your saved list.' });
    }

    res.status(200).json({ message: 'City removed successfully.' });
  } catch (err) {
    console.error('Delete city error:', err);
    res.status(500).json({ error: 'Failed to remove city.' });
  }
});

// PUT /api/saved-cities/:city/pin
router.put('/:city/pin', async (req, res) => {
  try {
    const targetCity = req.params.city.toLowerCase();
    
    // Unpin all other cities for this user
    await SavedCity.update({ isPinned: false }, { where: { userId: req.user.id } });
    
    // Pin the target city
    const [updated] = await SavedCity.update(
      { isPinned: true },
      { where: { userId: req.user.id, cityName: targetCity } }
    );

    if (updated === 0) return res.status(404).json({ error: 'City not found.' });
    res.json({ message: 'City pinned successfully.' });
  } catch (error) {
    console.error('Pin city error:', error);
    res.status(500).json({ error: 'Failed to pin city.' });
  }
});

module.exports = router;
