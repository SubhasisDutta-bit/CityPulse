// ============================================
// COMPLETE REACT COMPONENTS FOR CITYPULSE
// File: src/components/AllComponents.jsx
// ============================================

import { useState, useEffect } from 'react';
import { 
  Cloud, Droplets, Wind, Eye, Activity, Newspaper, 
  AlertTriangle, Zap, MapPin, Search, X, Moon, Sun,
  LogOut, Settings, Star, TrendingUp, Clock
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { format } from 'date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// ============================================
// WEATHER CARD COMPONENT
// ============================================
export const WeatherCard = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card">
        <p className="text-gray-500">No weather data available</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          Weather
        </h3>
        <span className="text-sm text-gray-500">{data.city}, {data.country}</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 text-center">
          <div className="flex items-center justify-center gap-4">
            <img 
              src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`}
              alt={data.description}
              className="w-20 h-20"
            />
            <div>
              <div className="text-5xl font-bold">{data.temperature}°C</div>
              <p className="text-gray-500 capitalize">{data.description}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-500" />
          <div>
            <p className="text-xs text-gray-500">Humidity</p>
            <p className="font-semibold">{data.humidity}%</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Wind Speed</p>
            <p className="font-semibold">{data.windSpeed} m/s</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-yellow-500" />
          <div>
            <p className="text-xs text-gray-500">Feels Like</p>
            <p className="font-semibold">{data.feelsLike}°C</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-500" />
          <div>
            <p className="text-xs text-gray-500">Pressure</p>
            <p className="font-semibold">{data.pressure} hPa</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// AQI CARD COMPONENT
// ============================================
export const AQICard = ({ data, loading }) => {
  const getAQIColor = (aqi) => {
    if (aqi <= 50) return 'aqi-good';
    if (aqi <= 100) return 'aqi-moderate';
    if (aqi <= 150) return 'aqi-unhealthy1';
    if (aqi <= 200) return 'aqi-unhealthy';
    if (aqi <= 300) return 'aqi-very-unhealthy';
    return 'aqi-hazardous';
  };

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card">
        <p className="text-gray-500">No AQI data available</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5" />
        Air Quality Index
      </h3>

      <div className="text-center mb-4">
        <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full text-4xl font-bold badge ${getAQIColor(data.aqi)}`}>
          {data.aqi}
        </div>
        <p className="mt-2 text-lg font-semibold">{data.level.text}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
          <p className="text-gray-500">PM2.5</p>
          <p className="font-semibold">{data.components.pm25 || 'N/A'}</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
          <p className="text-gray-500">PM10</p>
          <p className="font-semibold">{data.components.pm10 || 'N/A'}</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
          <p className="text-gray-500">O₃</p>
          <p className="font-semibold">{data.components.o3 || 'N/A'}</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
          <p className="text-gray-500">NO₂</p>
          <p className="font-semibold">{data.components.no2 || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// TRAFFIC CARD COMPONENT
// ============================================
export const TrafficCard = ({ data, loading }) => {
  const getTrafficColor = (intensity) => {
    switch (intensity) {
      case 'Low': return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'Moderate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
      case 'High': return 'text-orange-600 bg-orange-100 dark:bg-orange-900';
      case 'Very High': return 'text-red-600 bg-red-100 dark:bg-red-900';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card">
        <p className="text-gray-500">No traffic data available</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        Traffic Conditions
      </h3>

      <div className="space-y-4">
        <div className="text-center">
          <span className={`inline-flex px-6 py-3 rounded-lg text-xl font-bold ${getTrafficColor(data.intensity)}`}>
            {data.intensity}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
            <p className="text-xs text-gray-500">Congestion</p>
            <p className="text-lg font-bold">{data.congestionLevel}%</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
            <p className="text-xs text-gray-500">Avg Speed</p>
            <p className="text-lg font-bold">{data.averageSpeed} km/h</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
            <p className="text-xs text-gray-500">Incidents</p>
            <p className="text-lg font-bold">{data.incidents}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// NEWS CARD COMPONENT
// ============================================
export const NewsCard = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Newspaper className="w-5 h-5" />
          Latest News
        </h3>
        <p className="text-gray-500">No news available</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Newspaper className="w-5 h-5" />
        Latest News
      </h3>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {data.slice(0, 5).map((article, index) => (
          <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-b-0">
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary-600 transition-colors"
            >
              <h4 className="font-semibold text-sm mb-1">{article.title}</h4>
            </a>
            <p className="text-xs text-gray-500 mb-1">{article.description?.substring(0, 100)}...</p>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{article.source}</span>
              <span>{article.publishedAt ? format(new Date(article.publishedAt), 'MMM d, h:mm a') : ''}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// EARTHQUAKE CARD COMPONENT
// ============================================
export const EarthquakeCard = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Recent Earthquakes
        </h3>
        <p className="text-gray-500">No recent earthquakes within 500km</p>
      </div>
    );
  }

  const getMagnitudeColor = (mag) => {
    if (mag < 3) return 'text-green-600';
    if (mag < 5) return 'text-yellow-600';
    if (mag < 7) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5" />
        Recent Earthquakes
      </h3>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {data.slice(0, 10).map((quake, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-semibold text-sm">{quake.place}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Depth: {quake.depth} km • Distance: {quake.distance} km
                </p>
                <p className="text-xs text-gray-400">
                  {quake.time ? format(new Date(quake.time), 'MMM d, h:mm a') : ''}
                </p>
              </div>
              <div className={`text-2xl font-bold ml-3 ${getMagnitudeColor(quake.magnitude)}`}>
                {quake.magnitude.toFixed(1)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// POWER OUTAGE CARD COMPONENT
// ============================================
export const PowerOutageCard = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card">
        <p className="text-gray-500">No outage data available</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5" />
        Power Status
      </h3>

      <div className="space-y-4">
        <div className="text-center">
          {data.status === 'normal' ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-lg">
              <Zap className="w-5 h-5" />
              <span className="font-semibold">All Systems Normal</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">Outage Detected</span>
            </div>
          )}
        </div>

        {data.status === 'outage' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-center">
              <p className="text-xs text-gray-500">Affected Areas</p>
              <p className="text-xl font-bold">{data.affectedAreas}%</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-center">
              <p className="text-xs text-gray-500">Est. Restoration</p>
              <p className="text-sm font-semibold">
                {data.estimatedRestoration ? format(new Date(data.estimatedRestoration), 'h:mm a') : 'TBD'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// CITY SELECTOR COMPONENT
// ============================================
export const CitySelector = ({ onCitySelect, savedCities }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const mockCities = [
    { name: 'London', country: 'GB', lat: 51.5074, lon: -0.1278 },
    { name: 'New York', country: 'US', lat: 40.7128, lon: -74.0060 },
    { name: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503 },
    { name: 'Paris', country: 'FR', lat: 48.8566, lon: 2.3522 },
    { name: 'Sydney', country: 'AU', lat: -33.8688, lon: 151.2093 },
    { name: 'Mumbai', country: 'IN', lat: 19.0760, lon: 72.8777 },
    { name: 'Berlin', country: 'DE', lat: 52.5200, lon: 13.4050 },
    { name: 'Toronto', country: 'CA', lat: 43.6532, lon: -79.3832 },
    { name: 'Dubai', country: 'AE', lat: 25.2048, lon: 55.2708 },
    { name: 'Singapore', country: 'SG', lat: 1.3521, lon: 103.8198 },
  ];

  useEffect(() => {
    if (searchQuery.length >= 2) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        const results = mockCities.filter(city =>
          city.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(results);
        setIsSearching(false);
        setShowDropdown(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  }, [searchQuery]);

  const handleCityClick = (city) => {
    onCitySelect(city);
    setSearchQuery('');
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a city..."
          className="input-field pl-10 pr-10"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setShowDropdown(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center">
              <div className="loading-spinner mx-auto"></div>
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((city, index) => (
              <button
                key={index}
                onClick={() => handleCityClick(city)}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <div>
                  <p className="font-semibold">{city.name}</p>
                  <p className="text-sm text-gray-500">{city.country}</p>
                </div>
                <MapPin className="w-4 h-4 text-gray-400" />
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No cities found
            </div>
          )}
        </div>
      )}

      {savedCities && savedCities.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Star className="w-4 h-4" />
            Saved Cities
          </p>
          <div className="flex flex-wrap gap-2">
            {savedCities.map((city) => (
              <button
                key={city.id}
                onClick={() => handleCityClick({
                  name: city.cityName,
                  country: city.countryCode,
                  lat: parseFloat(city.latitude),
                  lon: parseFloat(city.longitude),
                })}
                className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
              >
                {city.cityName}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
