# CityPulse

A production-ready real-time city dashboard that provides live updates on weather, air quality, traffic, news, earthquakes, and power outages for any city worldwide.

## Features

### Real-Time Data

- Live Weather - Temperature, humidity, wind speed, pressure
- Air Quality Index (AQI) - PM2.5, PM10, O3, NO2 levels with alerts
- Traffic Intensity - Congestion levels and average speeds
- Latest News - Top headlines related to the selected city
- Earthquake Monitoring - Recent seismic activity within 500km radius
- Power Outage Status - Real-time grid status and affected areas

### User Experience

- City Search - Intelligent city selector with autocomplete
- Saved Cities - Bookmark favorite cities for quick access
- Auto-Refresh - Real-time WebSocket updates every 60 seconds
- Dark Mode - Beautiful dark theme with smooth transitions
- Smart Alerts - Browser notifications for high AQI and emergencies
- Responsive Design - Perfect on desktop, tablet, and mobile

### Technical Features

- Firebase Authentication - Secure Google and Email login
- WebSocket Real-Time - Socket.io for instant updates
- Smart Caching - 60-second cache to minimize API calls
- Data Visualization - Chart.js for beautiful graphs
- Rate Limiting - Protected API endpoints
- MySQL Database - Relational data with Sequelize ORM

### Technical Features

- 🔐 **Firebase Authentication** - Secure Google & Email login
- 🔌 **WebSocket Real-Time** - Socket.io for instant updates
- 💾 **Smart Caching** - 60-second cache to minimize API calls
- 📊 **Data Visualization** - Chart.js for beautiful graphs
- 🛡️ **Rate Limiting** - Protected API endpoints
- ⚙️ **MySQL Database** - Relational data with Sequelize ORM

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                    │
│  ┌──────────────┐  ┌───────────────┐  ┌─────────────────┐  │
│  │ City Search  │  │  Dashboard     │  │  Auth/Settings  │  │
│  │  Component   │  │  Components    │  │   Components    │  │
│  └──────────────┘  └───────────────┘  └─────────────────┘  │
│         │                   │                     │          │
│         └───────────────────┴─────────────────────┘          │
│                         │                                    │
│              ┌──────────┴──────────┐                         │
│              │  WebSocket Client   │                         │
│              │   Axios API Client  │                         │
│              └─────────────────────┘                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │  HTTP/REST + WebSocket
                       │
┌──────────────────────┴──────────────────────────────────────┐
│               Express.js Backend (Node.js)                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  REST API Layer        │    WebSocket Layer         │   │
│  │  - Auth Routes         │    - Socket.io Server      │   │
│  │  - City Routes         │    - Room Management       │   │
│  │  - Preferences         │    - Real-time Broadcast   │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         API Aggregation Service                     │   │
│  │  - OpenWeatherMap  - NewsAPI     - USGS            │   │
│  │  - WAQI (AQI)      - TomTom      - Mock Services   │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Middleware: Auth, CORS, Rate Limit, Compression   │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │  Sequelize ORM
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                    MySQL Database                           │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │   users    │  │ saved_cities │  │   preferences      │  │
│  │activity_log│  │              │  │                    │  │
│  └────────────┘  └──────────────┘  └────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- MySQL database (local or cloud)
- Firebase project
- API keys (OpenWeatherMap, NewsAPI, WAQI)

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/citypulse.git
cd citypulse
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run db:migrate
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your Firebase config
npm run dev
```

Frontend runs on `http://localhost:5173`

### 4. Access Application

Open browser: `http://localhost:5173`

---

## Project Structure

```
citypulse/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, Firebase config
│   │   ├── models/          # Sequelize models (User, SavedCity, etc.)
│   │   ├── routes/          # Express routes (auth, cities, preferences)
│   │   ├── services/        # Business logic (API, WebSocket, Cache)
│   │   ├── middleware/      # Auth, error handling
│   │   ├── database/        # Migration scripts
│   │   └── server.js        # Main server file
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components (Cards, Selector, etc.)
│   │   ├── context/         # Auth & Theme context providers
│   │   ├── services/        # API client, WebSocket service
│   │   ├── config/          # Firebase config
│   │   ├── App.jsx          # Main App component
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Tailwind CSS
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
├── ARCHITECTURE.md          # Detailed system design
├── DEPLOYMENT.md            # Deployment guide
└── README.md               # This file
```

---

## Technology Stack

### Frontend

- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Chart.js** - Data visualization
- **Socket.io Client** - WebSocket connections
- **Firebase SDK** - Authentication
- **Axios** - HTTP client
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

### Backend

- **Node.js & Express** - Server framework
- **Socket.io** - WebSocket server
- **Sequelize** - MySQL ORM
- **Firebase Admin** - Auth verification
- **Node-Cache** - In-memory caching
- **Helmet** - Security headers
- **Express Rate Limit** - API protection
- **Compression** - Response compression
- **Morgan** - HTTP logging

### Database

- **MySQL** - Relational database
- Tables: `users`, `saved_cities`, `preferences`, `activity_logs`

### External APIs

- **OpenWeatherMap** - Weather & AQI data
- **NewsAPI** - News headlines
- **WAQI** - Air quality index
- **USGS** - Earthquake data
- **TomTom** - Traffic data (optional)

---

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    photo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Saved Cities Table

```sql
CREATE TABLE saved_cities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    city_name VARCHAR(255) NOT NULL,
    country_code VARCHAR(10),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_city (user_id, city_name)
);
```

### Preferences Table

```sql
CREATE TABLE preferences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    settings_json JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Activity Logs Table

```sql
CREATE TABLE activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action ENUM('search', 'save', 'delete', 'view') NOT NULL,
    city_name VARCHAR(255),
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

---

## Authentication Flow

```
1. User clicks "Sign in with Google"
   ↓
2. Firebase Authentication (client-side)
   ↓
3. Get Firebase ID Token (JWT)
   ↓
4. Send token in Authorization header to backend
   ↓
5. Backend verifies token with Firebase Admin SDK
   ↓
6. Create/update user in MySQL database
   ↓
7. Return user data to client
   ↓
8. WebSocket connection authenticates with same token
```

---

## WebSocket Real-Time Flow

```
1. Client selects "London"
   ↓
2. HTTP GET /api/cities/data/London (immediate data)
   ↓
3. Socket.emit('join-city-room', { city: 'London', lat, lon })
   ↓
4. Server: socket.join('city:london')
   ↓
5. Server starts polling APIs every 60 seconds
   ↓
6. Server aggregates: Weather, AQI, Traffic, News, Earthquakes
   ↓
7. io.to('city:london').emit('city-data-update', data)
   ↓
8. All clients in room receive update simultaneously
   ↓
9. React state updates → UI re-renders
```

---

## API Endpoints

### Authentication

- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `DELETE /api/auth/account` - Delete account

### Cities

- `GET /api/cities/data/:city` - Get city data
- `GET /api/cities/search?q=query` - Search cities
- `POST /api/cities/save` - Save city to favorites
- `GET /api/cities/saved` - Get saved cities
- `DELETE /api/cities/saved/:id` - Remove saved city

### Preferences

- `GET /api/preferences` - Get user preferences
- `PUT /api/preferences` - Update preferences

### Stats

- `GET /api/stats` - Server statistics (WebSocket, cache, uptime)

---

## UI Components

### Dashboard Cards

- **WeatherCard** - Current conditions with icon
- **AQICard** - Air quality with color-coded levels
- **TrafficCard** - Traffic intensity indicator
- **NewsCard** - Latest headlines with sources
- **EarthquakeCard** - Recent seismic activity
- **PowerOutageCard** - Grid status indicator

### Utility Components

- **CitySelector** - Search with autocomplete
- **Header** - Navigation with user menu
- **ThemeToggle** - Dark/light mode switch
- **LoadingSpinner** - Loading states
- **Toast Notifications** - Success/error messages

---

## Notifications

### Browser Notifications

```javascript
// Request permission on app load
Notification.requestPermission();

// Show notification on high AQI
if (Notification.permission === "granted") {
  new Notification("CityPulse Alert", {
    body: "AQI in London is 165 - Unhealthy!",
    icon: "/icon.png",
  });
}
```

### In-App Toasts

- Success: "City saved!"
- Error: "Failed to load data"
- Warning: "High AQI detected"
- Info: "Refreshing data..."

---

## Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Manual API Testing

```bash
# Health check
curl http://localhost:5000/health

# Get weather
curl http://localhost:5000/api/cities/data/London?lat=51.5074&lon=-0.1278

# With authentication
curl -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  http://localhost:5000/api/auth/me
```

---

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

### Quick Deploy

**Backend (Render):**

```bash
# Push to GitHub, then:
# 1. Connect repo to Render
# 2. Add environment variables
# 3. Deploy!
```

**Frontend (Vercel):**

```bash
npm install -g vercel
cd frontend
vercel --prod
```

**Database (PlanetScale):**

```bash
pscale database create citypulse
pscale connect citypulse main
```

---

## Security Features

-  Firebase JWT verification on all protected routes
-  Rate limiting (100 requests per 15 minutes)
-  CORS protection (whitelist frontend domain)
-  Helmet security headers
-  SQL injection protection (Sequelize ORM)
-  XSS protection (React auto-escaping)
-  Environment variables for secrets
-  HTTPS enforced in production

---

## ⚡ Performance Optimizations

### Backend

- **Caching**: 60-second TTL for API responses
- **Compression**: Gzip for all responses
- **Connection Pooling**: MySQL connection pool (max 5)
- **Lazy Loading**: Only poll active city rooms

### Frontend

- **Code Splitting**: Dynamic imports for routes
- **Image Optimization**: WebP format, lazy loading
- **Memoization**: React.memo for expensive components
- **Debouncing**: Search input (300ms delay)

---

## Scaling Strategy

### Current (MVP)

- Single Node.js instance
- In-memory cache
- Direct API calls
- PlanetScale free tier

### Phase 2 (100-1000 users)

- Redis for distributed caching
- Load balancer (2-3 backend instances)
- Database read replicas
- CDN for static assets

### Phase 3 (1000+ users)

- Microservices architecture
- Message queue (RabbitMQ/Bull)
- Separate WebSocket servers
- Kubernetes orchestration
- Auto-scaling

---

##  Known Issues & Limitations

### Free Tier Limitations

- **NewsAPI**: 100 requests/day (caching extends this)
- **OpenWeatherMap**: 60 calls/minute (sufficient for MVP)
- **PlanetScale**: 5GB storage, 1 billion row reads/month

### Feature Limitations

- Traffic data is mocked (TomTom API requires premium)
- Power outage data is mocked (no free public API)
- City search uses predefined list (geocoding API optional)

### Browser Support

- Modern browsers only (Chrome 90+, Firefox 88+, Safari 14+)
- WebSocket support required
- Notification API optional

---

##  Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- ESLint for JavaScript
- Prettier for formatting
- Follow React best practices
- Write descriptive commit messages

---

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

##  Acknowledgments

- **OpenWeatherMap** for weather data
- **NewsAPI** for news headlines
- **WAQI** for air quality data
- **USGS** for earthquake information
- **Firebase** for authentication
- **Vercel** for frontend hosting
- **Render** for backend hosting
- **PlanetScale** for MySQL database

---

##  Roadmap

### v1.1 (Next Release)

- [ ] Historical data charts (7-day trends)
- [ ] Email/SMS alerts for severe weather
- [ ] City comparison view (side-by-side)
- [ ] Export data as PDF/CSV

### v1.2

- [ ] Mobile apps (iOS/Android)
- [ ] Widget for iOS/Android home screen
- [ ] Public API for developers
- [ ] Embeddable dashboard widgets

### v2.0

- [ ] AI-powered predictions
- [ ] Community reports (crowdsourced data)
- [ ] Multi-language support
- [ ] Premium features (advanced analytics)

---

## 📊 Stats

- **Lines of Code**: ~5,000+
- **Components**: 15+
- **API Integrations**: 5
- **Database Tables**: 4
- **Real-time Updates**: Every 60 seconds
- **Supported Cities**: 1000+

---

**Built with by developers, for everyone who cares about their city.**

 Star this repo if you found it helpful!
