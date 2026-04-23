import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Sun, User as UserIcon, LogOut } from 'lucide-react';
import WeatherCard from './components/WeatherCard';
import AqiCard from './components/AqiCard';
import NewsCard from './components/NewsCard';
import AuthModal from './components/AuthModal';
import ProfilePanel from './components/ProfilePanel';
import ChatAssistant from './components/ChatAssistant';

function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [aqiData, setAqiData] = useState(null);
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Auth & Profile State
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);

  // Animation states
  const [introStage, setIntroStage] = useState('revolve');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));

    const blastTimer = setTimeout(() => setIntroStage('blast'), 2000);
    const doneTimer = setTimeout(() => setIntroStage('done'), 2800);

    return () => { clearTimeout(blastTimer); clearTimeout(doneTimer); };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowProfilePanel(false);
  };

  const executeTelemetryScan = async (searchCity) => {
    if (!searchCity.trim()) return;

    setLoading(true);
    setError('');
    setWeatherData(null);
    setAqiData(null);
    setNewsData(null);

    const targetCity = encodeURIComponent(searchCity.trim());

    try {
      const [weatherRes, aqiRes, newsRes] = await Promise.allSettled([
        axios.get(`http://localhost:5000/api/weather/${targetCity}`),
        axios.get(`http://localhost:5000/api/aqi/${targetCity}`),
        axios.get(`http://localhost:5000/api/news/${targetCity}`)
      ]);

      if (weatherRes.status === 'fulfilled') {
        setWeatherData(weatherRes.value.data);
      } else {
        throw new Error(weatherRes.reason.response?.data?.error || 'Failed to fetch core weather data.');
      }

      if (aqiRes.status === 'fulfilled') setAqiData(aqiRes.value.data);
      if (newsRes.status === 'fulfilled') setNewsData(newsRes.value.data);

    } catch (err) {
      setError(err.message || 'Failed to fetch telemetry. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCityData = (e) => {
    e.preventDefault();
    executeTelemetryScan(city);
  };

  const handleCitySelect = (selectedCity) => {
    setCity(selectedCity);
    executeTelemetryScan(selectedCity);
  };

  if (introStage !== 'done') {
    return (
      <div className="fixed inset-0 bg-[#020617] flex items-center justify-center z-50 overflow-hidden">
        <Sun 
          className={`text-yellow-400 w-40 h-40 ${introStage === 'revolve' ? 'animate-revolve' : 'animate-blast'}`} 
          strokeWidth={1.5}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans relative overflow-x-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          onLoginSuccess={(userData) => setUser(userData)} 
        />
      )}

      {showProfilePanel && user && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setShowProfilePanel(false)}></div>
          <ProfilePanel user={user} onClose={() => setShowProfilePanel(false)} onCitySelect={handleCitySelect} />
        </>
      )}

      {/* Auth Header */}
      <div className="absolute top-6 right-8 z-20 animate-fade-in">
        {user ? (
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowProfilePanel(true)}
              className="flex items-center space-x-3 bg-slate-900/80 hover:bg-slate-800 backdrop-blur border border-slate-700 hover:border-cyan-500/50 rounded-full pl-4 pr-4 py-1.5 transition-colors group"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-bold text-slate-300 group-hover:text-white truncate max-w-[120px]">{user.email}</span>
            </button>
            <button 
              onClick={handleLogout}
              className="bg-slate-900/80 border border-slate-700 hover:bg-slate-800 p-2 rounded-full text-slate-400 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setShowAuthModal(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full font-bold text-sm tracking-widest uppercase shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-colors"
          >
            <UserIcon className="w-4 h-4" />
            <span>Login</span>
          </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto relative z-10 animate-fade-in">
        <header className="mb-14 text-center mt-8">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 tracking-tighter mb-4 drop-shadow-sm">
            CITYPULSE
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em]">
            Real-Time Global Dashboard
          </p>
        </header>

        <form onSubmit={fetchCityData} className="mb-14">
          <div className="relative max-w-xl mx-auto group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative flex items-center">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Initialize satellite scan (e.g., Tokyo)..."
                className="w-full pl-6 pr-16 py-5 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 text-white font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 shadow-2xl"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-2 bottom-2 px-4 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 rounded-xl transition-all duration-300 flex items-center justify-center border border-cyan-500/30 group-focus-within:bg-cyan-500/30"
              >
                <Search className="w-6 h-6" />
              </button>
            </div>
          </div>
        </form>

        {loading && (
          <div className="flex flex-col justify-center items-center mb-8 space-y-4">
            <svg viewBox="0 0 100 100" className="w-16 h-16 animate-[spin_3s_linear_infinite]">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="2" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="#22d3ee" strokeWidth="4" strokeDasharray="50 150" className="opacity-80 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <circle cx="50" cy="50" r="25" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="30 130" className="opacity-60" />
            </svg>
            <span className="text-cyan-400 text-xs font-bold tracking-widest uppercase animate-pulse">Syncing nodes...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 backdrop-blur p-5 mb-8 rounded-2xl max-w-xl mx-auto">
            <p className="text-red-400 font-medium text-center">{error}</p>
          </div>
        )}

        {weatherData && !loading && (
          <div className="animate-fade-in space-y-8 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              <WeatherCard data={weatherData} user={user} />
              <AqiCard data={aqiData} />
            </div>
            
            <NewsCard data={newsData} />
          </div>
        )}
      </div>

      <ChatAssistant city={weatherData?.city} />
    </div>
  );
}

export default App;
