const axios = require('axios');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60 });

const OPENWEATHER_BASE = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Fetch current weather for a city from OpenWeatherMap API.
 * Returns a cleaned, frontend-friendly payload.
 */
async function getWeather(city) {
  const cacheKey = `weather_${city.toLowerCase()}`;
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    throw new Error('OpenWeather API key is not configured. Set OPENWEATHER_API_KEY in .env');
  }

  let d;
  try {
    const response = await axios.get(OPENWEATHER_BASE, {
      params: {
        q: city,
        appid: apiKey,
        units: 'metric',
      },
    });
    d = response.data;
  } catch (err) {
    if (err.response && err.response.status === 401) {
      console.warn(`[Weather Service] 401 Unauthorized for "${city}". API key may be inactive. Yielding mock data.`);
      const mockData = {
        city: city.charAt(0).toUpperCase() + city.slice(1),
        country: 'Mock',
        temperature: Math.floor(Math.random() * (35 - 10 + 1) + 10),
        feelsLike: Math.floor(Math.random() * (38 - 10 + 1) + 10),
        humidity: Math.floor(Math.random() * (100 - 30 + 1) + 30),
        pressure: Math.floor(Math.random() * (1030 - 1000 + 1) + 1000),
        windSpeed: (Math.random() * 15).toFixed(1),
        description: ['clear sky', 'light rain', 'overcast clouds', 'scattered clouds', 'snow'][Math.floor(Math.random() * 5)] + ' (Mocked)',
        icon: ['01d', '10d', '04d', '03d', '13d'][Math.floor(Math.random() * 5)],
        iconUrl: 'https://openweathermap.org/img/wn/01d@2x.png',
        timestamp: new Date().toISOString(),
      };
      cache.set(cacheKey, mockData);
      return mockData;
    }
    throw err;
  }

  const result = {
    city: d.name,
    country: d.sys.country,
    temperature: d.main.temp,
    feelsLike: d.main.feels_like,
    humidity: d.main.humidity,
    pressure: d.main.pressure,
    windSpeed: d.wind.speed,
    description: d.weather[0].description,
    icon: d.weather[0].icon,
    iconUrl: `https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png`,
    timestamp: new Date(d.dt * 1000).toISOString(),
  };

  cache.set(cacheKey, result);
  return result;
}

module.exports = { getWeather };
