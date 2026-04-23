import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Trash2, MapPin } from 'lucide-react';

const ProfilePanel = ({ user, onClose, onCitySelect }) => {
  const [savedCities, setSavedCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSavedCities();
  }, []);

  const fetchSavedCities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/saved-cities', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedCities(response.data);
    } catch (err) {
      setError('Failed to load saved telemetry.');
    } finally {
      setLoading(false);
    }
  };

  const removeCity = async (cityName, e) => {
    e.stopPropagation(); // Prevent triggering the city selection
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/saved-cities/${encodeURIComponent(cityName)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedCities(savedCities.filter(c => c.cityName !== cityName.toLowerCase()));
    } catch (err) {
      console.error('Failed to remove city');
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#0A0F1C] border-l border-slate-800 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#050810]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Agent Profile</h2>
          <p className="text-xs font-mono text-cyan-500 mt-1">{user.email}</p>
        </div>
        <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors bg-slate-800/50 rounded-full">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 relative">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-800 pb-2">
          Tracked Locations
        </h3>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-red-400 text-sm font-medium">{error}</div>
        ) : savedCities.length === 0 ? (
          <div className="text-center py-10 text-slate-500 font-medium">
            No locations tracked yet. Scan a city and click the star icon to save it.
          </div>
        ) : (
          <div className="space-y-3">
            {savedCities.map((city) => (
              <div 
                key={city.id}
                onClick={() => {
                  onCitySelect(city.cityName);
                  onClose();
                }}
                className="group flex items-center justify-between p-4 bg-slate-800/20 hover:bg-cyan-900/20 border border-slate-800 hover:border-cyan-500/30 rounded-lg cursor-pointer transition-all"
              >
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
                  <span className="text-white font-medium capitalize">{city.cityName}</span>
                </div>
                <button 
                  onClick={(e) => removeCity(city.cityName, e)}
                  className="text-slate-600 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-all rounded bg-slate-900/50 hover:bg-red-900/20"
                  title="Untrack location"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePanel;
