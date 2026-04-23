import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { Preference } from '../models/index.js';

const router = express.Router();

/**
 * GET /api/preferences
 * Get user preferences
 */
router.get('/', authenticateUser, asyncHandler(async (req, res) => {
  let preference = await Preference.findOne({
    where: { userId: req.user.id },
  });

  // Create default preferences if they don't exist
  if (!preference) {
    preference = await Preference.create({
      userId: req.user.id,
      settingsJson: {
        theme: 'light',
        autoRefresh: true,
        refreshInterval: 60,
        notifications: {
          aqi: true,
          earthquake: true,
        },
      },
    });
  }

  res.json({
    success: true,
    data: preference,
  });
}));

/**
 * PUT /api/preferences
 * Update user preferences
 */
router.put('/', authenticateUser, asyncHandler(async (req, res) => {
  const { settingsJson } = req.body;

  let preference = await Preference.findOne({
    where: { userId: req.user.id },
  });

  if (!preference) {
    preference = await Preference.create({
      userId: req.user.id,
      settingsJson: settingsJson,
    });
  } else {
    preference.settingsJson = settingsJson;
    await preference.save();
  }

  res.json({
    success: true,
    data: preference,
  });
}));

export default router;
