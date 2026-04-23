import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import websocketService from '../services/websocketService.js';
import cacheService from '../services/cacheService.js';

const router = express.Router();

/**
 * GET /api/stats
 * Get server statistics
 */
router.get('/', asyncHandler(async (req, res) => {
  const wsStats = websocketService.getStats();
  const cacheStats = cacheService.getStats();

  res.json({
    success: true,
    data: {
      websocket: wsStats,
      cache: cacheStats,
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
      },
    },
  });
}));

export default router;
