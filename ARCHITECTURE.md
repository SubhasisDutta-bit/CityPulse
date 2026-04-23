# CityPulse - Real-Time City Dashboard
## System Architecture Documentation

### 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  React SPA (Vite + Tailwind)                              │  │
│  │  - City Selector Component                                │  │
│  │  - Dashboard Cards (Weather, AQI, Traffic, News, Quakes) │  │
│  │  - Real-time Charts (Chart.js)                            │  │
│  │  - Firebase Auth SDK                                      │  │
│  │  - Socket.io Client                                       │  │
│  └───────────────────────────────────────────────────────────┘  │
│           │                                    ▲                 │
│           │ HTTP/REST                          │ WebSocket       │
│           ▼                                    │                 │
└───────────────────────────────────────────────────────────────────┘
            │                                    │
            │                                    │
┌───────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                            │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Express.js Server (Node.js)                                │ │
│  │  ┌─────────────────┐  ┌──────────────────┐                 │ │
│  │  │  REST API       │  │  WebSocket Layer │                 │ │
│  │  │  - Auth Routes  │  │  - Socket.io     │                 │ │
│  │  │  - City Routes  │  │  - Room Mgmt     │                 │ │
│  │  │  - User Routes  │  │  - Broadcast     │                 │ │
│  │  └─────────────────┘  └──────────────────┘                 │ │
│  │                                                              │ │
│  │  ┌─────────────────────────────────────────────────────┐   │ │
│  │  │  API Aggregation Service                            │   │ │
│  │  │  - Weather API (OpenWeatherMap)                     │   │ │
│  │  │  - AQI API (WAQI/OpenWeatherMap)                    │   │ │
│  │  │  - Traffic API (TomTom/Google)                      │   │ │
│  │  │  - News API (NewsAPI.org)                           │   │ │
│  │  │  - Earthquake (USGS)                                │   │ │
│  │  │  - Power Outage (Mock Service)                      │   │ │
│  │  └─────────────────────────────────────────────────────┘   │ │
│  │                                                              │ │
│  │  ┌─────────────────────────────────────────────────────┐   │ │
│  │  │  Middleware Layer                                   │   │ │
│  │  │  - Firebase JWT Verification                        │   │ │
│  │  │  - Rate Limiting                                    │   │ │
│  │  │  - CORS                                             │   │ │
│  │  │  - Error Handling                                   │   │ │
│  │  └─────────────────────────────────────────────────────┘   │ │
│  │                                                              │ │
│  │  ┌─────────────────────────────────────────────────────┐   │ │
│  │  │  Caching Layer (In-Memory)                          │   │ │
│  │  │  - 60s cache for API responses                      │   │ │
│  │  │  - Reduces external API calls                       │   │ │
│  │  └─────────────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│           │                                    ▲                 │
│           │ Sequelize ORM                      │                 │
│           ▼                                    │                 │
└───────────────────────────────────────────────────────────────────┘
            │                                    │
            │                                    │
┌───────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  MySQL Database (PlanetScale/Railway)                       │ │
│  │  ┌──────────────┐  ┌─────────────────┐  ┌────────────────┐ │ │
│  │  │   users      │  │  saved_cities   │  │  preferences   │ │ │
│  │  ├──────────────┤  ├─────────────────┤  ├────────────────┤ │ │
│  │  │ id (PK)      │  │ id (PK)         │  │ id (PK)        │ │ │
│  │  │ firebase_uid │  │ user_id (FK)    │  │ user_id (FK)   │ │ │
│  │  │ email        │  │ city_name       │  │ settings_json  │ │ │
│  │  │ display_name │  │ latitude        │  │ created_at     │ │ │
│  │  │ created_at   │  │ longitude       │  │ updated_at     │ │ │
│  │  │ updated_at   │  │ created_at      │  └────────────────┘ │ │
│  │  └──────────────┘  └─────────────────┘                     │ │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────┐                  │ │
│  │  │       activity_logs                  │                  │ │
│  │  ├──────────────────────────────────────┤                  │ │
│  │  │ id (PK)                              │                  │ │
│  │  │ user_id (FK)                         │                  │ │
│  │  │ action (enum: search, save, delete) │                  │ │
│  │  │ city_name                            │                  │ │
│  │  │ created_at                           │                  │ │
│  │  └──────────────────────────────────────┘                  │ │
│  └─────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
            │
            │
┌───────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                               │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐   │
│  │ OpenWeatherMap │  │   NewsAPI      │  │  Firebase Auth   │   │
│  └────────────────┘  └────────────────┘  └──────────────────┘   │
│  ┌────────────────┐  ┌────────────────┐                          │
│  │     WAQI       │  │  USGS Earthqua │                          │
│  └────────────────┘  └────────────────┘                          │
└───────────────────────────────────────────────────────────────────┘
```

---

## 🔄 WebSocket Real-Time Flow

```
1. Client Connects & Authenticates
   ┌──────────┐                    ┌──────────┐
   │  Client  │─── Socket.io ────→ │  Server  │
   └──────────┘    (handshake)     └──────────┘
                                         │
                                         ▼
                                   Verify Firebase Token
                                         │
                                         ▼
                                   Join City Room
                                   "city:london"

2. City Selection
   User selects "London"
   │
   ├─→ HTTP POST /api/cities/select
   │   └─→ Server logs selection in DB
   │
   └─→ Socket emits: join-city-room { city: "london" }
       └─→ Server: socket.join("city:london")

3. Data Polling & Broadcasting (Server-Side Loop)
   Every 60 seconds:
   ┌─────────────────────────────────────┐
   │ Background Poller (setInterval)     │
   │                                     │
   │ For each active city room:          │
   │  ├─→ Fetch Weather API              │
   │  ├─→ Fetch AQI API                  │
   │  ├─→ Fetch Traffic API              │
   │  ├─→ Fetch News API                 │
   │  ├─→ Fetch Earthquake API           │
   │  └─→ Generate Mock Outage Data      │
   │                                     │
   │ Aggregate Response                  │
   │  ↓                                  │
   │ io.to("city:london").emit(          │
   │   "city-data-update",               │
   │   { weather, aqi, traffic, ... }    │
   │ )                                   │
   └─────────────────────────────────────┘
          │
          ▼
   ┌──────────────────────┐
   │ All Connected Clients│
   │ in "city:london" room│
   │ receive update       │
   └──────────────────────┘

4. Client Updates UI
   Client receives "city-data-update" event
   │
   ├─→ Update Weather Card
   ├─→ Update AQI Chart
   ├─→ Update Traffic Indicator
   ├─→ Update News Feed
   ├─→ Update Earthquake List
   └─→ Update Power Outage Status
```

---

## 🗄️ Database Schema (MySQL)

```sql
-- Users Table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    photo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_firebase_uid (firebase_uid),
    INDEX idx_email (email)
);

-- Saved Cities Table
CREATE TABLE saved_cities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    city_name VARCHAR(255) NOT NULL,
    country_code VARCHAR(10),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    UNIQUE KEY unique_user_city (user_id, city_name)
);

-- User Preferences Table
CREATE TABLE preferences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    settings_json JSON,
    -- Example: {"theme": "dark", "autoRefresh": true, "refreshInterval": 60}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Activity Logs Table
CREATE TABLE activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action ENUM('search', 'save', 'delete', 'view') NOT NULL,
    city_name VARCHAR(255),
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_action (user_id, action),
    INDEX idx_created_at (created_at)
);
```

---

## 🔐 Authentication Flow

```
1. Client-Side Firebase Login
   ┌──────────┐
   │  User    │
   └────┬─────┘
        │ Clicks "Sign in with Google"
        ▼
   ┌─────────────────────┐
   │ Firebase Auth SDK   │
   │ - signInWithPopup() │
   └─────────┬───────────┘
             │
             ▼
   Get ID Token (JWT)
   firebase.auth().currentUser.getIdToken()
        │
        ▼
   Store in localStorage + set in Axios headers

2. Backend JWT Verification
   Client Request
   │
   ├─→ Authorization: Bearer <FIREBASE_JWT>
   │
   ▼
   ┌────────────────────────────────┐
   │ Express Middleware             │
   │ - Extract token from header    │
   │ - admin.auth().verifyIdToken() │
   │ - Decode user info             │
   │ - Attach req.user              │
   └────────────────────────────────┘
        │
        ▼
   Protected Route Handler
   (User authenticated)

3. User Creation/Lookup
   First login → Check if user exists in MySQL
   │
   ├─→ If NOT exists: INSERT into users table
   └─→ If exists: Return user data
```

---

## ⚡ API Rate Limiting Strategy

### External API Limits
- **OpenWeatherMap**: 60 calls/min (Free tier)
- **NewsAPI**: 100 requests/day (Free tier)
- **WAQI**: 1000 requests/day
- **USGS**: No strict limit

### Caching Strategy
```javascript
// In-Memory Cache (60 seconds TTL)
const cache = new Map();

function getCachedData(key, ttl = 60000) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  return null;
}

function setCachedData(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

// Usage in API aggregator
async function getWeatherData(city) {
  const cacheKey = `weather:${city}`;
  let data = getCachedData(cacheKey);
  
  if (!data) {
    data = await fetchFromWeatherAPI(city);
    setCachedData(cacheKey, data);
  }
  
  return data;
}
```

### Rate Limiting (Express)
```javascript
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
  message: 'Too many requests, please try again later.'
});

app.use('/api/', apiLimiter);
```

---

## 📊 Data Visualization Components

### 1. Weather Card
- Temperature (current, feels like, min/max)
- Humidity, Wind Speed, Pressure
- Icon representing conditions

### 2. AQI Chart (Chart.js Line Chart)
- Historical AQI values (mocked or from cache)
- Color-coded zones: Good (0-50), Moderate (51-100), Unhealthy (101+)

### 3. Traffic Heatmap
- Color indicator: Green (Free Flow), Yellow (Moderate), Red (Congested)

### 4. News Feed
- Latest 5 headlines related to the city
- Source, published time, description

### 5. Earthquake List
- Recent earthquakes within 500km
- Magnitude, depth, distance from city

### 6. Power Outage Status
- Mock data: % of areas affected
- Estimated restoration time

---

## 🚀 Deployment Architecture

### Frontend (Vercel)
```bash
# Build: npm run build (Vite)
# Output: dist/
# Environment Variables:
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_API_URL=https://citypulse-backend.onrender.com
```

### Backend (Render)
```bash
# Build: npm install
# Start: npm start
# Environment Variables:
DATABASE_URL=mysql://user:pass@host:3306/citypulse
FIREBASE_SERVICE_ACCOUNT=...
OPENWEATHER_API_KEY=...
NEWS_API_KEY=...
WAQI_API_KEY=...
PORT=5000
```

### Database (PlanetScale)
```bash
# Connection String:
mysql://user:password@host.us-east-1.psdb.cloud/citypulse?ssl={"rejectUnauthorized":true}

# Automatic backups, branching, scaling
```

---

## 🧠 Scalability Considerations

### Current Design (MVP)
- Single Node.js instance
- In-memory cache
- Direct API calls

### Future Enhancements
1. **Redis Cache**: Replace in-memory cache with Redis for multi-instance support
2. **Message Queue**: Use RabbitMQ/Bull for background API polling
3. **Load Balancer**: Nginx/AWS ALB for horizontal scaling
4. **CDN**: Cloudflare for static assets
5. **Microservices**: Split API aggregation into separate services
6. **Database Replication**: Read replicas for high read traffic

---

## 🔔 Notification System

### High AQI Alerts
```javascript
// Server-side logic
if (aqiData.aqi > 150) {
  io.to(`city:${city}`).emit('alert', {
    type: 'aqi',
    severity: 'high',
    message: `AQI in ${city} is ${aqiData.aqi} - Unhealthy!`,
    timestamp: new Date()
  });
}

// Client-side handler
socket.on('alert', (alert) => {
  if (Notification.permission === 'granted') {
    new Notification(alert.message);
  }
  // Also show in-app toast
});
```

---

## 🌓 Dark Mode Implementation

```javascript
// Tailwind CSS with dark mode class strategy
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  // ...
}

// React Context
const ThemeContext = createContext();

function toggleTheme() {
  const newTheme = theme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  localStorage.setItem('theme', newTheme);
  document.documentElement.classList.toggle('dark');
}
```

---

## 🛡️ Error Handling & Fallbacks

### API Failure Strategies
1. **Retry Logic**: 3 retries with exponential backoff
2. **Fallback Data**: Use last cached data if API fails
3. **Partial Data**: Display available data even if one API fails
4. **User Notification**: Show warning badge on failed components

```javascript
async function fetchWithRetry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
}
```

---

## 📈 Performance Optimizations

1. **Code Splitting**: Lazy load dashboard components
2. **Image Optimization**: WebP format, responsive images
3. **Bundle Size**: Tree-shaking, dynamic imports
4. **Memoization**: React.memo for expensive components
5. **Debouncing**: City search input
6. **Compression**: Gzip/Brotli on server responses

---

## 🧪 Testing Strategy

### Frontend
- Jest + React Testing Library
- Component unit tests
- Integration tests for data flow

### Backend
- Jest + Supertest
- API endpoint tests
- WebSocket connection tests
- Database integration tests

### E2E
- Playwright for critical user flows

---

## 📋 Project Checklist

- [x] System architecture documented
- [x] Database schema designed
- [x] API aggregation strategy
- [x] WebSocket real-time flow
- [x] Authentication system
- [x] Rate limiting strategy
- [x] Caching mechanism
- [x] Error handling
- [x] Deployment plan
- [x] Scalability roadmap

---

**END OF ARCHITECTURE DOCUMENT**
