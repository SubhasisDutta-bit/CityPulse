import axios from 'axios';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export const getWeatherByCity = async (city) => {
  try {
    if (!OPENWEATHER_API_KEY) {
      throw new Error('OPENWEATHER_API_KEY not configured');
    }

    const response = await axios.get(OPENWEATHER_BASE_URL, {
      params: {
        q: city,
        appid: OPENWEATHER_API_KEY,
        units: 'metric', // Celsius
      },
    });

    const { main, weather, wind, clouds } = response.data;

    return {
      city: response.data.name,
      country: response.data.sys.country,
      temperature: main.temp,
      feelsLike: main.feels_like,
      humidity: main.humidity,
      pressure: main.pressure,
      description: weather[0].description,
      icon: weather[0].icon,
      windSpeed: wind.speed,
      cloudiness: clouds.all,
    };
  } catch (error) {
    throw new Error(`Failed to fetch weather: ${error.message}`);
  }
};
