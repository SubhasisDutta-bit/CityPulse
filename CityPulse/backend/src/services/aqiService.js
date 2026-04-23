const axios = require('axios');
const NodeCache = require('node-cache');
// Cache for 60 seconds
const cache = new NodeCache({ stdTTL: 60 });

/**
 * Returns mock AQI data for fallback scenarios
 */
const getMockAQIData = () => {
  // AQI ranges from 1 (Good) to 5 (Very Poor) in OpenWeather format
  const aqi = Math.floor(Math.random() * 5) + 1;
  const pm2_5 = (Math.random() * 50).toFixed(2);
  const pm10 = (Math.random() * 80).toFixed(2);
  
  return {
    aqi,
    pm2_5: parseFloat(pm2_5),
    pm10: parseFloat(pm10),
    isMock: true,
    timestamp: new Date().toISOString()
  };
};

const getAQI = async (city) => {
  const cacheKey = `aqi_${city.toLowerCase()}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey || apiKey === 'YOUR_OPENWEATHER_API_KEY') {
    const mockDb = getMockAQIData();
    cache.set(cacheKey, mockDb);
    return mockDb;
  }

  try {
    // 1. Get Lat/Lon for the city
    const geoResponse = await axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`);
    
    if (geoResponse.data.length === 0) {
      throw new Error('City not found');
    }

    const { lat, lon } = geoResponse.data[0];

    // 2. Fetch Air Pollution data
    const aqiResponse = await axios.get(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
    
    const data = aqiResponse.data.list[0];
    
    const result = {
      aqi: data.main.aqi,
      pm2_5: data.components.pm2_5,
      pm10: data.components.pm10,
      timestamp: new Date().toISOString()
    };

    cache.set(cacheKey, result);
    return result;

  } catch (error) {
    console.error(`Error fetching AQI for ${city}:`, error.message);
    // If it's a 401, return mock robustly
    if (error.response && error.response.status === 401) {
      const mockResult = getMockAQIData();
      cache.set(cacheKey, mockResult);
      return mockResult;
    }
    
    // Otherwise throw so router can handle 500
    throw error;
  }
};

module.exports = {
  getAQI
};
