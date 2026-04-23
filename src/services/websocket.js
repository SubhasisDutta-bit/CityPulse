import { io } from 'socket.io-client';
import { auth } from '../config/firebase';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket.id);
      this.isConnected = true;
      this.authenticate();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    this.socket.on('authenticated', (data) => {
      console.log('✅ Authenticated:', data.user);
    });

    this.socket.on('auth-error', (data) => {
      console.error('Authentication error:', data.message);
    });

    this.socket.on('error', (data) => {
      console.error('Socket error:', data.message);
    });
  }

  async authenticate() {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        this.socket.emit('authenticate', { token });
      }
    } catch (error) {
      console.error('Failed to authenticate WebSocket:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('WebSocket disconnected manually');
    }
  }

  joinCityRoom(city, latitude, longitude) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, attempting to connect...');
      this.connect();
      // Wait a bit for connection
      setTimeout(() => {
        this.socket?.emit('join-city-room', { city, latitude, longitude });
      }, 1000);
    } else {
      this.socket.emit('join-city-room', { city, latitude, longitude });
      console.log(`Joined city room: ${city}`);
    }
  }

  leaveCityRoom(city) {
    if (this.socket?.connected) {
      this.socket.emit('leave-city-room', { city });
      console.log(`Left city room: ${city}`);
    }
  }

  requestRefresh(city, latitude, longitude) {
    if (this.socket?.connected) {
      this.socket.emit('request-refresh', { city, latitude, longitude });
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      
      // Store listener reference for cleanup
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      
      // Remove from stored listeners
      if (this.listeners.has(event)) {
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    }
  }

  removeAllListeners(event) {
    if (this.socket) {
      this.socket.removeAllListeners(event);
      this.listeners.delete(event);
    }
  }
}

export default new WebSocketService();
