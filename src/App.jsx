import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { Moon, Sun, LogOut, Settings, Star, RefreshCw, Bell } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import websocketService from './services/websocket';
import { api } from './services/api';
import {
  CitySelector,
  WeatherCard,
  AQICard,
  TrafficCard,
  NewsCard,
  EarthquakeCard,
  PowerOutageCard,
} from './components/AllComponents';

const App = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [selectedCity, setSelectedCity] = useState(null);
  const [cityData, setCityData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedCities, setSavedCities] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fetch saved cities
  useEffect(() => {
    if (user) {
      fetchSavedCities();
    }
  }, [user]);

  const fetchSavedCities = async () => {
    try {
      const response = await api.cities.getSaved();
      setSavedCities(response.data.data);
    } catch (error) {
      console.error('Error fetching saved cities:', error);
    }
  };

  // Handle city selection
  const handleCitySelect = async (city) => {
    setSelectedCity(city);
    setLoading(true);

    try {
      // Fetch initial data via HTTP
      const response = await api.cities.getData(city.name, city.lat, city.lon);
      setCityData(response.data.data);
      setLastUpdate(new Date());

      // Join WebSocket room for real-time updates
      websocketService.joinCityRoom(city.name, city.lat, city.lon);

      toast.success(`Viewing ${city.name}`);
    } catch (error) {
      console.error('Error fetching city data:', error);
      toast.error('Failed to load city data');
    } finally {
      setLoading(false);
    }
  };

  // Setup WebSocket listeners
  useEffect(() => {
    const handleDataUpdate = (data) => {
      console.log('📡 Received city data update:', data);
      setCityData(data);
      setLastUpdate(new Date());
    };

    const handleAlert = (alert) => {
      console.log('🚨 Alert received:', alert);
      if (alert.type === 'aqi' && alert.severity === 'high') {
        toast.error(alert.message, { duration: 5000, icon: '🚨' });
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification('CityPulse Alert', {
            body: alert.message,
            icon: '/icon.png',
          });
        }
      }
    };

    websocketService.on('city-data-update', handleDataUpdate);
    websocketService.on('alert', handleAlert);

    return () => {
      websocketService.off('city-data-update', handleDataUpdate);
      websocketService.off('alert', handleAlert);
    };
  }, []);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Handle save city
  const handleSaveCity = async () => {
    if (!selectedCity || !user) {
      toast.error('Please login to save cities');
      return;
    }

    try {
      await api.cities.save({
        cityName: selectedCity.name,
        countryCode: selectedCity.country,
        latitude: selectedCity.lat,
        longitude: selectedCity.lon,
      });
      toast.success('City saved!');
      fetchSavedCities();
    } catch (error) {
      console.error('Error saving city:', error);
      toast.error('Failed to save city');
    }
  };

  // Manual refresh
  const handleManualRefresh = () => {
    if (selectedCity) {
      websocketService.requestRefresh(selectedCity.name, selectedCity.lat, selectedCity.lon);
      toast.success('Refreshing data...');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                🌆 CityPulse
              </h1>
              <span className="hidden sm:inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm font-medium">
                Real-time Dashboard
              </span>
            </div>

            <div className="flex items-center gap-3">
              {lastUpdate && (
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Updated {lastUpdate.toLocaleTimeString()}
                </div>
              )}

              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {user && (
                <>
                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`p-2 rounded-lg transition-colors ${
                      autoRefresh 
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    aria-label="Toggle auto-refresh"
                  >
                    <Bell className="w-5 h-5" />
                  </button>

                  <button
                    onClick={logout}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <img
                      src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`}
                      alt={user.displayName || user.email}
                      className="w-8 h-8 rounded-full"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* City Selector */}
        <div className="mb-8">
          <div className="card">
            <CitySelector 
              onCitySelect={handleCitySelect} 
              savedCities={savedCities}
            />

            {selectedCity && (
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedCity.name}, {selectedCity.country}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedCity.lat.toFixed(4)}, {selectedCity.lon.toFixed(4)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleManualRefresh}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                  {user && (
                    <button
                      onClick={handleSaveCity}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Star className="w-4 h-4" />
                      Save
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Grid */}
        {selectedCity && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <WeatherCard data={cityData?.weather} loading={loading} />
            <AQICard data={cityData?.aqi} loading={loading} />
            <TrafficCard data={cityData?.traffic} loading={loading} />
            <div className="md:col-span-2 lg:col-span-1">
              <NewsCard data={cityData?.news} loading={loading} />
            </div>
            <EarthquakeCard data={cityData?.earthquakes} loading={loading} />
            <PowerOutageCard data={cityData?.powerOutage} loading={loading} />
          </div>
        )}

        {/* Empty State */}
        {!selectedCity && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="text-2xl font-bold mb-2">Welcome to CityPulse</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Select a city to view real-time weather, air quality, traffic, news, and more.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            © 2024 CityPulse. Real-time city dashboard powered by multiple data sources.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
