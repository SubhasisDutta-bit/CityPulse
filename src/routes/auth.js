import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { User } from '../models/index.js';

const router = express.Router();

/**
 * GET /api/auth/me
 * Get current user information
 */
router.get('/me', authenticateUser, asyncHandler(async (req, res) => {
  const user = await User.findOne({
    where: { firebaseUid: req.user.uid },
    attributes: ['id', 'firebaseUid', 'email', 'displayName', 'photoUrl', 'createdAt'],
  });

  res.json({
    success: true,
    data: user,
  });
}));

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', authenticateUser, asyncHandler(async (req, res) => {
  const { displayName, photoUrl } = req.body;

  const user = await User.findOne({
    where: { firebaseUid: req.user.uid },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  if (displayName !== undefined) user.displayName = displayName;
  if (photoUrl !== undefined) user.photoUrl = photoUrl;

  await user.save();

  res.json({
    success: true,
    data: user,
  });
}));

/**
 * DELETE /api/auth/account
 * Delete user account
 */
router.delete('/account', authenticateUser, asyncHandler(async (req, res) => {
  const user = await User.findOne({
    where: { firebaseUid: req.user.uid },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  await user.destroy();

  res.json({
    success: true,
    message: 'Account deleted successfully',
  });
}));

export default router;
