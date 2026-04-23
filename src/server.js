import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import sequelize from './config/database.js';
import { syncModels } from './models/index.js';
import websocketService from './services/websocketService.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import citiesRoutes from './routes/cities.js';
import preferencesRoutes from './routes/preferences.js';
import statsRoutes from './routes/stats.js';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// ===========================
// MIDDLEWARE
// ===========================

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Compression
app.use(compression());

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ===========================
// ROUTES
// ===========================

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'CityPulse API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/cities', citiesRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/stats', statsRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'CityPulse API',
    version: '1.0.0',
    description: 'Real-time city dashboard backend',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      cities: '/api/cities',
      preferences: '/api/preferences',
      stats: '/api/stats',
    },
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ===========================
// DATABASE & WEBSOCKET SETUP
// ===========================

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Sync models (create tables if they don't exist)
    // WARNING: In production, use migrations instead of sync()
    if (process.env.NODE_ENV === 'development') {
      await syncModels(false); // Don't force drop tables
    }

    // Initialize WebSocket server
    websocketService.initialize(server);

    // Start HTTP server
    server.listen(PORT, () => {
      console.log('╔════════════════════════════════════════╗');
      console.log('║     🌆 CityPulse Backend Server       ║');
      console.log('╚════════════════════════════════════════╝');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔌 WebSocket enabled`);
      console.log(`⏰ Poll interval: ${process.env.DATA_POLL_INTERVAL || 60000}ms`);
      console.log('════════════════════════════════════════');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('📴 SIGTERM received, shutting down gracefully...');
  server.close(async () => {
    await sequelize.close();
    console.log('👋 Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('📴 SIGINT received, shutting down gracefully...');
  server.close(async () => {
    await sequelize.close();
    console.log('👋 Server closed');
    process.exit(0);
  });
});

// Start the server
startServer();

export default app;
