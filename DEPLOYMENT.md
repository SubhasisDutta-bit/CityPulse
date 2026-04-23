# CityPulse Deployment Guide

## 📋 Prerequisites

- Node.js 18+ installed
- MySQL database (local or cloud)
- Firebase project created
- API keys for external services

---

## 🔑 Get Required API Keys

### 1. Firebase Setup
1. Go to https://console.firebase.google.com
2. Create a new project
3. Enable Authentication → Google Sign-in
4. Go to Project Settings → Service Accounts
5. Generate a new private key (download JSON)
6. Copy Firebase config from Web App settings

### 2. OpenWeatherMap
- Sign up at https://openweathermap.org/api
- Get free API key (60 calls/minute)

### 3. NewsAPI
- Sign up at https://newsapi.org
- Get free API key (100 requests/day)

### 4. WAQI (Air Quality)
- Sign up at https://aqicn.org/data-platform/token/
- Get free API token

---

## 🗄️ Database Setup

### Option 1: Local MySQL
```bash
# Install MySQL (if not already)
brew install mysql  # macOS
sudo apt install mysql-server  # Ubuntu

# Create database
mysql -u root -p
CREATE DATABASE citypulse;
```

### Option 2: PlanetScale (Recommended for production)
```bash
# Install PlanetScale CLI
brew install planetscale/tap/pscale

# Create database
pscale database create citypulse --region us-east

# Get connection string
pscale connect citypulse main --port 3309
# Connection string: mysql://127.0.0.1:3309/citypulse
```

### Option 3: Railway
1. Go to https://railway.app
2. Create new project → MySQL
3. Copy DATABASE_URL from variables

---

## 🚀 Backend Deployment (Render)

### 1. Prepare Backend
```bash
cd backend
npm install

# Create .env file with all variables
cp .env.example .env
# Edit .env with your actual values
```

### 2. Deploy to Render
1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repository
4. Configure:
   - Name: `citypulse-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: Free

5. Add Environment Variables:
```
NODE_ENV=production
DATABASE_URL=<your_mysql_url>
FIREBASE_SERVICE_ACCOUNT_KEY=<paste_entire_json>
OPENWEATHER_API_KEY=<your_key>
NEWS_API_KEY=<your_key>
WAQI_API_KEY=<your_key>
CORS_ORIGIN=https://citypulse.vercel.app
PORT=5000
```

6. Deploy!

### 3. Run Database Migration
```bash
# After deployment, use Render shell or run locally:
npm run db:migrate
```

---

## 🎨 Frontend Deployment (Vercel)

### 1. Prepare Frontend
```bash
cd frontend
npm install

# Create .env file
cp .env.example .env
# Edit with your values
```

### 2. Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: citypulse
# - Directory: ./
# - Build command: npm run build
# - Output directory: dist
```

### 3. Add Environment Variables in Vercel Dashboard
```
VITE_FIREBASE_API_KEY=<your_key>
VITE_FIREBASE_AUTH_DOMAIN=<your_domain>
VITE_FIREBASE_PROJECT_ID=<your_project_id>
VITE_FIREBASE_STORAGE_BUCKET=<your_bucket>
VITE_FIREBASE_MESSAGING_SENDER_ID=<your_sender_id>
VITE_FIREBASE_APP_ID=<your_app_id>
VITE_API_URL=https://citypulse-backend.onrender.com
VITE_WS_URL=https://citypulse-backend.onrender.com
```

### 4. Redeploy
```bash
vercel --prod
```

---

## 🏃 Local Development

### Backend
```bash
cd backend

# Install dependencies
npm install

# Setup .env (copy from .env.example)
cp .env.example .env

# Run migrations
npm run db:migrate

# Start development server
npm run dev

# Server runs on http://localhost:5000
```

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Setup .env
cp .env.example .env

# Start development server
npm run dev

# App runs on http://localhost:5173
```

---

## 🧪 Testing

### Backend API
```bash
# Health check
curl http://localhost:5000/health

# Get city data
curl http://localhost:5000/api/cities/data/London?lat=51.5074&lon=-0.1278
```

### WebSocket
Open browser console:
```javascript
const socket = io('http://localhost:5000');
socket.on('connect', () => console.log('Connected'));
socket.emit('join-city-room', { 
  city: 'London', 
  latitude: 51.5074, 
  longitude: -0.1278 
});
socket.on('city-data-update', data => console.log(data));
```

---

## 🔒 Security Checklist

- [ ] Never commit `.env` files
- [ ] Use environment variables for all secrets
- [ ] Enable CORS only for your frontend domain
- [ ] Set up rate limiting (already configured)
- [ ] Use HTTPS in production
- [ ] Verify Firebase tokens on backend
- [ ] Sanitize user inputs
- [ ] Keep dependencies updated

---

## 📊 Monitoring

### Check Server Stats
```bash
curl https://citypulse-backend.onrender.com/api/stats
```

Returns:
```json
{
  "websocket": {
    "connectedClients": 5,
    "activeRooms": 3
  },
  "cache": {
    "keys": 12,
    "hits": 45,
    "misses": 8
  },
  "server": {
    "uptime": 3600,
    "memory": {...}
  }
}
```

---

## 🐛 Troubleshooting

### Database Connection Failed
- Check `DATABASE_URL` format: `mysql://user:pass@host:port/database`
- For PlanetScale, ensure SSL is enabled
- Test connection: `npm run db:migrate`

### Firebase Auth Not Working
- Verify all Firebase config variables
- Check Firebase console for enabled auth methods
- Ensure domain is authorized in Firebase settings

### WebSocket Not Connecting
- Check CORS_ORIGIN includes frontend URL
- Verify WS_URL in frontend matches backend URL
- Check Render logs for connection errors

### API Rate Limits
- OpenWeather free tier: 60 calls/min
- News API free tier: 100/day
- Implement caching (already done, 60s TTL)

---

## 📈 Performance Optimization

### Backend
- Use Redis for caching (upgrade from in-memory)
- Add database indexes
- Enable gzip compression (already enabled)
- Use CDN for static assets

### Frontend
- Lazy load components
- Optimize images (WebP format)
- Enable service worker for offline support
- Use React.memo for expensive components

---

## 🔄 CI/CD Pipeline (Optional)

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd backend && npm install && npm test

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd frontend && npm install && npm run build
```

---

## 📝 Environment Variables Reference

### Backend (.env)
```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=mysql://user:pass@host:port/citypulse
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
OPENWEATHER_API_KEY=your_key
NEWS_API_KEY=your_key
WAQI_API_KEY=your_key
CORS_ORIGIN=https://citypulse.vercel.app
CACHE_TTL=60000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
WS_PING_TIMEOUT=60000
WS_PING_INTERVAL=25000
DATA_POLL_INTERVAL=60000
```

### Frontend (.env)
```bash
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_API_URL=https://citypulse-backend.onrender.com
VITE_WS_URL=https://citypulse-backend.onrender.com
```

---

## ✅ Post-Deployment Checklist

- [ ] Backend health endpoint responds
- [ ] Database tables created
- [ ] Firebase authentication works
- [ ] WebSocket connection successful
- [ ] Real-time updates working
- [ ] All API integrations functioning
- [ ] Dark mode works
- [ ] Mobile responsive
- [ ] Error handling works
- [ ] Notifications work

---

## 🎉 You're Done!

Access your app at:
- Frontend: https://citypulse.vercel.app
- Backend: https://citypulse-backend.onrender.com

For issues, check:
- Render logs: https://dashboard.render.com
- Vercel logs: https://vercel.com/dashboard
- Browser console (F12)
