import express from 'express';
import { authenticateUser, optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { SavedCity, ActivityLog } from '../models/index.js';
import apiService from '../services/apiService.js';

const router = express.Router();

/**
 * GET /api/cities/data/:city
 * Get real-time data for a city
 */
router.get('/data/:city', optionalAuth, asyncHandler(async (req, res) => {
  const { city } = req.params;
  const { lat, lon } = req.query;

  if (!city) {
    return res.status(400).json({
      success: false,
      error: 'City name is required',
    });
  }

  const latitude = lat ? parseFloat(lat) : null;
  const longitude = lon ? parseFloat(lon) : null;

  // Log activity if user is authenticated
  if (req.user) {
    await ActivityLog.create({
      userId: req.user.id,
      action: 'view',
      cityName: city,
      metadata: { latitude, longitude },
    });
  }

  const cityData = await apiService.getCityData(city, latitude, longitude);

  res.json({
    success: true,
    data: cityData,
  });
}));

/**
 * POST /api/cities/save
 * Save a city to user's favorites
 */
router.post('/save', authenticateUser, asyncHandler(async (req, res) => {
  const { cityName, countryCode, latitude, longitude } = req.body;

  if (!cityName) {
    return res.status(400).json({
      success: false,
      error: 'City name is required',
    });
  }

  const [savedCity, created] = await SavedCity.findOrCreate({
    where: {
      userId: req.user.id,
      cityName: cityName,
    },
    defaults: {
      userId: req.user.id,
      cityName: cityName,
      countryCode: countryCode || null,
      latitude: latitude || null,
      longitude: longitude || null,
    },
  });

  // Log activity
  await ActivityLog.create({
    userId: req.user.id,
    action: 'save',
    cityName: cityName,
  });

  res.status(created ? 201 : 200).json({
    success: true,
    data: savedCity,
    message: created ? 'City saved successfully' : 'City already saved',
  });
}));

/**
 * GET /api/cities/saved
 * Get user's saved cities
 */
router.get('/saved', authenticateUser, asyncHandler(async (req, res) => {
  const savedCities = await SavedCity.findAll({
    where: { userId: req.user.id },
    order: [['createdAt', 'DESC']],
  });

  res.json({
    success: true,
    data: savedCities,
  });
}));

/**
 * DELETE /api/cities/saved/:id
 * Remove a saved city
 */
router.delete('/saved/:id', authenticateUser, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const savedCity = await SavedCity.findOne({
    where: {
      id: id,
      userId: req.user.id,
    },
  });

  if (!savedCity) {
    return res.status(404).json({
      success: false,
      error: 'Saved city not found',
    });
  }

  // Log activity
  await ActivityLog.create({
    userId: req.user.id,
    action: 'delete',
    cityName: savedCity.cityName,
  });

  await savedCity.destroy();

  res.json({
    success: true,
    message: 'City removed successfully',
  });
}));

/**
 * GET /api/cities/search
 * Search for cities (geocoding)
 */
router.get('/search', asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Search query must be at least 2 characters',
    });
  }

  // Simple mock city search (in production, use OpenWeatherMap Geocoding API)
  const mockCities = [
    { name: 'London', country: 'GB', lat: 51.5074, lon: -0.1278 },
    { name: 'New York', country: 'US', lat: 40.7128, lon: -74.0060 },
    { name: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503 },
    { name: 'Paris', country: 'FR', lat: 48.8566, lon: 2.3522 },
    { name: 'Sydney', country: 'AU', lat: -33.8688, lon: 151.2093 },
    { name: 'Mumbai', country: 'IN', lat: 19.0760, lon: 72.8777 },
    { name: 'Berlin', country: 'DE', lat: 52.5200, lon: 13.4050 },
    { name: 'Toronto', country: 'CA', lat: 43.6532, lon: -79.3832 },
    { name: 'Dubai', country: 'AE', lat: 25.2048, lon: 55.2708 },
    { name: 'Singapore', country: 'SG', lat: 1.3521, lon: 103.8198 },
  ];

  const results = mockCities.filter(city => 
    city.name.toLowerCase().includes(q.toLowerCase())
  );

  res.json({
    success: true,
    data: results,
  });
}));

export default router;
