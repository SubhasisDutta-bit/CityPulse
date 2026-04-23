import { Server } from 'socket.io';
import admin from 'firebase-admin';
import firebaseApp from '../config/firebase.js';
import apiService from './apiService.js';

/**
 * WebSocket Service using Socket.io
 * Handles real-time city data updates
 */
class WebSocketService {
  constructor() {
    this.io = null;
    this.activeRooms = new Map(); // Track active city rooms
    this.pollInterval = parseInt(process.env.DATA_POLL_INTERVAL || '60000');
    this.pollingTimers = new Map();
  }

  /**
   * Initialize Socket.io server
   */
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: parseInt(process.env.WS_PING_TIMEOUT || '60000'),
      pingInterval: parseInt(process.env.WS_PING_INTERVAL || '25000'),
    });

    this.setupEventHandlers();
    console.log('✅ WebSocket server initialized');
  }

  /**
   * Setup Socket.io event handlers
   */
  setupEventHandlers() {
    this.io.on('connection', async (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // Handle authentication
      socket.on('authenticate', async (data) => {
        try {
          const { token } = data;

          if (!token) {
            socket.emit('auth-error', { message: 'No token provided' });
            return;
          }

          // Verify Firebase token
          if (firebaseApp) {
            const decodedToken = await admin.auth().verifyIdToken(token);
            socket.userId = decodedToken.uid;
            socket.userEmail = decodedToken.email;
            socket.emit('authenticated', { 
              success: true,
              user: { uid: decodedToken.uid, email: decodedToken.email }
            });
          } else {
            // Mock auth for development
            socket.userId = 'mock-user';
            socket.userEmail = 'mock@example.com';
            socket.emit('authenticated', { 
              success: true,
              user: { uid: 'mock-user', email: 'mock@example.com' }
            });
          }

          console.log(`✅ User authenticated: ${socket.userEmail}`);
        } catch (error) {
          console.error('Authentication error:', error);
          socket.emit('auth-error', { message: 'Invalid token' });
        }
      });

      // Handle joining a city room
      socket.on('join-city-room', async (data) => {
        try {
          const { city, latitude, longitude } = data;

          if (!city) {
            socket.emit('error', { message: 'City name required' });
            return;
          }

          const roomName = `city:${city.toLowerCase()}`;

          // Leave previous rooms
          Array.from(socket.rooms)
            .filter(room => room.startsWith('city:'))
            .forEach(room => {
              socket.leave(room);
              console.log(`📤 ${socket.id} left room: ${room}`);
            });

          // Join new room
          socket.join(roomName);
          console.log(`📥 ${socket.id} joined room: ${roomName}`);

          // Track active room
          if (!this.activeRooms.has(roomName)) {
            this.activeRooms.set(roomName, {
              city,
              latitude,
              longitude,
              clients: new Set(),
            });
            
            // Start polling for this city
            this.startPolling(roomName, city, latitude, longitude);
          }

          this.activeRooms.get(roomName).clients.add(socket.id);

          // Send immediate data update
          const cityData = await apiService.getCityData(city, latitude, longitude);
          socket.emit('city-data-update', cityData);

        } catch (error) {
          console.error('Error joining city room:', error);
          socket.emit('error', { message: 'Failed to join city room' });
        }
      });

      // Handle leaving a city room
      socket.on('leave-city-room', (data) => {
        const { city } = data;
        const roomName = `city:${city.toLowerCase()}`;
        
        socket.leave(roomName);
        console.log(`📤 ${socket.id} left room: ${roomName}`);

        // Clean up room tracking
        const room = this.activeRooms.get(roomName);
        if (room) {
          room.clients.delete(socket.id);
          
          // Stop polling if no clients in room
          if (room.clients.size === 0) {
            this.stopPolling(roomName);
            this.activeRooms.delete(roomName);
          }
        }
      });

      // Handle manual refresh request
      socket.on('request-refresh', async (data) => {
        try {
          const { city, latitude, longitude } = data;
          const cityData = await apiService.getCityData(city, latitude, longitude);
          socket.emit('city-data-update', cityData);
        } catch (error) {
          console.error('Error refreshing data:', error);
          socket.emit('error', { message: 'Failed to refresh data' });
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);

        // Clean up room tracking
        this.activeRooms.forEach((room, roomName) => {
          room.clients.delete(socket.id);
          
          if (room.clients.size === 0) {
            this.stopPolling(roomName);
            this.activeRooms.delete(roomName);
          }
        });
      });
    });
  }

  /**
   * Start polling data for a city room
   */
  startPolling(roomName, city, latitude, longitude) {
    if (this.pollingTimers.has(roomName)) {
      return; // Already polling
    }

    console.log(`🔄 Started polling for ${roomName}`);

    const timer = setInterval(async () => {
      try {
        // Check if room still has clients
        const room = this.activeRooms.get(roomName);
        if (!room || room.clients.size === 0) {
          this.stopPolling(roomName);
          return;
        }

        // Fetch and broadcast data
        const cityData = await apiService.getCityData(city, latitude, longitude);
        
        this.io.to(roomName).emit('city-data-update', cityData);
        
        console.log(`📡 Broadcasted update to ${roomName} (${room.clients.size} clients)`);

        // Check for alerts
        if (cityData.aqi && cityData.aqi.aqi > 150) {
          this.io.to(roomName).emit('alert', {
            type: 'aqi',
            severity: 'high',
            message: `AQI in ${city} is ${cityData.aqi.aqi} - ${cityData.aqi.level.text}!`,
            timestamp: new Date().toISOString(),
          });
        }

      } catch (error) {
        console.error(`Error polling ${roomName}:`, error);
      }
    }, this.pollInterval);

    this.pollingTimers.set(roomName, timer);
  }

  /**
   * Stop polling data for a city room
   */
  stopPolling(roomName) {
    const timer = this.pollingTimers.get(roomName);
    if (timer) {
      clearInterval(timer);
      this.pollingTimers.delete(roomName);
      console.log(`⏹️  Stopped polling for ${roomName}`);
    }
  }

  /**
   * Broadcast message to a specific room
   */
  broadcastToRoom(roomName, event, data) {
    this.io.to(roomName).emit(event, data);
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcastToAll(event, data) {
    this.io.emit(event, data);
  }

  /**
   * Get server statistics
   */
  getStats() {
    return {
      connectedClients: this.io?.engine?.clientsCount || 0,
      activeRooms: this.activeRooms.size,
      rooms: Array.from(this.activeRooms.entries()).map(([name, room]) => ({
        name,
        clients: room.clients.size,
      })),
    };
  }
}

export default new WebSocketService();
