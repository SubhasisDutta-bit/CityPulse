import React, { useState } from 'react';
import axios from 'axios';
import { Star } from 'lucide-react';

const WeatherCard = ({ data, user }) => {
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error', or null

  if (!data) return null;

  const handleSaveCity = async () => {
    if (!user) return;
    setSaving(true);
    setSaveStatus(null);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/saved-cities', 
        { cityName: data.city },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaveStatus('success');
    } catch (err) {
      if (err.response?.data?.error === 'City already saved.') {
        setSaveStatus('success'); // Visually treat as success if already saved
      } else {
        setSaveStatus('error');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative max-w-full lg:max-w-xl mx-auto group">
      {/* Glow behind card */}
      <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
      
      <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-3xl overflow-hidden h-full">
        {/* Header section */}
        <div className="p-8 pb-6 border-b border-slate-700/50 flex justify-between items-center bg-gradient-to-b from-slate-800/40 to-transparent">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-md">{data.city}</h2>
              {user && (
                <button 
                  onClick={handleSaveCity}
                  disabled={saving || saveStatus === 'success'}
                  className="mt-1 transition-colors"
                  title="Save Location to Profile"
                >
                  <Star className={`w-5 h-5 ${saveStatus === 'success' ? 'fill-yellow-400 text-yellow-400' : 'text-slate-500 hover:text-yellow-400'} ${saving ? 'animate-pulse' : ''}`} />
                </button>
              )}
            </div>
            <p className="text-sm font-bold text-cyan-400 uppercase tracking-[0.2em] mt-2">{data.country}</p>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/50 shadow-inner group-hover:scale-110 transition-transform duration-500 group-hover:rotate-6">
            <img src={data.iconUrl} alt={data.description} className="w-16 h-16 drop-shadow-lg" />
          </div>
        </div>

        {/* Main numbers */}
        <div className="p-8 relative overflow-hidden">
          {/* subtle abstract shape in background */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-start mb-10 space-x-6 relative z-10">
            <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 tracking-tighter leading-none">
              {Math.round(data.temperature)}°
            </span>
            <div className="pt-2">
              <p className="text-xl font-bold text-slate-200 capitalize">{data.description}</p>
              <div className="inline-flex items-center px-3 py-1 mt-2 bg-slate-800/80 border border-slate-700/50 rounded-full">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Feels like</span>
                <span className="text-sm font-bold text-cyan-400 ml-2">{Math.round(data.feelsLike)}°</span>
              </div>
            </div>
          </div>

          {/* Footer Grid */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-700/50 relative z-10">
            <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-4 border border-slate-700/30 hover:bg-slate-800/60 transition-colors">
              <span className="block text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-2">Humidity</span>
              <span className="text-2xl font-black text-white">{data.humidity}<span className="text-sm text-cyan-400 font-bold ml-1">%</span></span>
            </div>
            <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-4 border border-slate-700/30 hover:bg-slate-800/60 transition-colors">
              <span className="block text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-2">Wind</span>
              <span className="text-2xl font-black text-white">{data.windSpeed}<span className="text-sm text-cyan-400 font-bold ml-1">m/s</span></span>
            </div>
            <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-4 border border-slate-700/30 hover:bg-slate-800/60 transition-colors">
              <span className="block text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-2">Pressure</span>
              <span className="text-2xl font-black text-white">{data.pressure}<span className="text-sm text-cyan-400 font-bold ml-1">hPa</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
