import admin from 'firebase-admin';
import firebaseApp from '../config/firebase.js';
import { User } from '../models/index.js';

/**
 * Middleware to verify Firebase JWT token
 * Attaches user information to req.user
 */
export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - No token provided',
      });
    }

    const token = authHeader.split('Bearer ')[1];

    // If Firebase is not configured, use mock auth for development
    if (!firebaseApp) {
      console.warn('⚠️  Using mock authentication (Firebase not configured)');
      req.user = {
        uid: 'mock-user-123',
        email: 'mock@example.com',
        name: 'Mock User',
      };
      return next();
    }

    // Verify the Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Find or create user in database
    const [user] = await User.findOrCreate({
      where: { firebaseUid: decodedToken.uid },
      defaults: {
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name || null,
        photoUrl: decodedToken.picture || null,
      },
    });

    // Attach user to request
    req.user = {
      id: user.id,
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for endpoints that work with or without auth
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split('Bearer ')[1];

    if (!firebaseApp) {
      req.user = null;
      return next();
    }

    const decodedToken = await admin.auth().verifyIdToken(token);

    const [user] = await User.findOrCreate({
      where: { firebaseUid: decodedToken.uid },
      defaults: {
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name || null,
        photoUrl: decodedToken.picture || null,
      },
    });

    req.user = {
      id: user.id,
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
    };

    next();
  } catch (error) {
    // On error, just proceed without user
    req.user = null;
    next();
  }
};
