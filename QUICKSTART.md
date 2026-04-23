# 🚀 CityPulse Quick Start Guide

Get CityPulse running in 5 minutes!

## 📋 What You Need

1. **Node.js 18+** - [Download here](https://nodejs.org)
2. **MySQL Database** - Local or [PlanetScale free tier](https://planetscale.com)
3. **Firebase Project** - [Create here](https://console.firebase.google.com)
4. **API Keys** (all free):
   - [OpenWeatherMap](https://openweathermap.org/api) - Weather data
   - [NewsAPI](https://newsapi.org) - News headlines  
   - [WAQI](https://aqicn.org/data-platform/token/) - Air quality

---

## ⚡ 5-Minute Setup

### Step 1: Get the Code
```bash
# Clone or download the project
cd citypulse
```

### Step 2: Backend Setup (2 minutes)
```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env - add your keys:
# DATABASE_URL=mysql://root:password@localhost:3306/citypulse
# FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
# OPENWEATHER_API_KEY=your_key
# NEWS_API_KEY=your_key
# WAQI_API_KEY=your_key

# Create database tables
npm run db:migrate

# Start backend
npm run dev
```

✅ Backend running at http://localhost:5000

### Step 3: Frontend Setup (2 minutes)
```bash
cd frontend
npm install

# Create .env file
cp .env.example .env

# Edit .env - add Firebase config:
# VITE_FIREBASE_API_KEY=your_firebase_api_key
# VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
# etc...

# Start frontend
npm run dev
```

✅ Frontend running at http://localhost:5173

### Step 4: Test It!
1. Open http://localhost:5173
2. Sign in with Google
3. Search for "London"
4. Watch real-time data appear!

---

## 🔑 Getting API Keys

### Firebase (5 minutes)
1. Go to https://console.firebase.google.com
2. Click "Create Project"
3. Name it "CityPulse"
4. Enable Google Analytics (optional)
5. Go to Authentication → Sign-in method → Enable Google
6. Go to Project Settings → General → Your apps → Web app
7. Copy the config values to frontend `.env`
8. Go to Service Accounts → Generate new private key
9. Copy entire JSON to backend `.env` as `FIREBASE_SERVICE_ACCOUNT_KEY`

### OpenWeatherMap (2 minutes)
1. Sign up at https://openweathermap.org/api
2. Click "API keys"
3. Copy "Key" value to backend `.env`

### NewsAPI (2 minutes)
1. Sign up at https://newsapi.org/register
2. Copy API key to backend `.env`

### WAQI (2 minutes)
1. Go to https://aqicn.org/data-platform/token/
2. Fill form and submit
3. Check email for token
4. Copy to backend `.env`

---

## 🗄️ Database Options

### Option A: Local MySQL (if installed)
```bash
mysql -u root -p
CREATE DATABASE citypulse;

# Use in .env:
DATABASE_URL=mysql://root:YOUR_PASSWORD@localhost:3306/citypulse
```

### Option B: PlanetScale (recommended)
```bash
# Install CLI
brew install planetscale/tap/pscale

# Create database
pscale auth login
pscale database create citypulse --region us-east

# Connect
pscale connect citypulse main --port 3309

# Use in .env:
DATABASE_URL=mysql://127.0.0.1:3309/citypulse
```

### Option C: Railway
1. Go to https://railway.app
2. New Project → Provision MySQL
3. Copy DATABASE_URL from Variables tab
4. Use in backend `.env`

---

## ✅ Verification Checklist

Backend:
- [ ] `curl http://localhost:5000/health` returns JSON
- [ ] No errors in terminal
- [ ] Database tables created

Frontend:
- [ ] App loads at http://localhost:5173
- [ ] Google sign-in works
- [ ] City search shows results

Real-time:
- [ ] Select a city
- [ ] Data loads immediately
- [ ] Check console: "WebSocket connected"
- [ ] Wait 60 seconds → data auto-refreshes

---

## 🐛 Common Issues

### "Cannot connect to database"
- Check MySQL is running: `mysql -u root -p`
- Verify DATABASE_URL format
- Run migration: `npm run db:migrate`

### "Firebase auth error"
- Check all VITE_FIREBASE_* variables in frontend .env
- Verify FIREBASE_SERVICE_ACCOUNT_KEY in backend .env
- Enable Google sign-in in Firebase Console

### "WebSocket not connecting"
- Backend must be running on port 5000
- Check VITE_WS_URL in frontend .env
- Look for CORS errors in browser console

### "API rate limit"
- You hit the free tier limit
- Wait an hour or upgrade API plan
- Check cache is working (should reduce calls)

---

## 📚 Next Steps

1. Read [README.md](README.md) for full documentation
2. See [DEPLOYMENT.md](DEPLOYMENT.md) to deploy to production
3. Check [ARCHITECTURE.md](ARCHITECTURE.md) for system design

---

## 💡 Pro Tips

- Use **mock data** if APIs fail (already implemented)
- Enable **browser notifications** for alerts
- Try **dark mode** with the moon icon
- **Save cities** to quickly switch between them
- Check **/api/stats** endpoint for server metrics

---

## 🎉 You're Ready!

Your real-time city dashboard is running. Enjoy! 🌆

Need help? Check the troubleshooting section or open an issue.
