import axios from 'axios';
import cacheService from './cacheService.js';

/**
 * API Aggregation Service
 * Fetches data from multiple external APIs with caching and error handling
 */
class ApiService {
  constructor() {
    this.openWeatherApiKey = process.env.OPENWEATHER_API_KEY;
    this.newsApiKey = process.env.NEWS_API_KEY;
    this.waqiApiKey = process.env.WAQI_API_KEY;
    this.tomtomApiKey = process.env.TOMTOM_API_KEY;
  }

  /**
   * Fetch with retry logic
   */
  async fetchWithRetry(fetchFn, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        return await fetchFn();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
      }
    }
  }

  /**
   * Fetch weather data from OpenWeatherMap
   */
  async getWeather(city) {
    const cacheKey = `weather:${city.toLowerCase()}`;
    
    return cacheService.getOrSet(cacheKey, async () => {
      if (!this.openWeatherApiKey) {
        return this.getMockWeather(city);
      }

      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.openWeatherApiKey}&units=metric`;
      
      const response = await this.fetchWithRetry(() => axios.get(url));
      
      return {
        temperature: Math.round(response.data.main.temp),
        feelsLike: Math.round(response.data.main.feels_like),
        tempMin: Math.round(response.data.main.temp_min),
        tempMax: Math.round(response.data.main.temp_max),
        humidity: response.data.main.humidity,
        pressure: response.data.main.pressure,
        windSpeed: response.data.wind.speed,
        description: response.data.weather[0].description,
        icon: response.data.weather[0].icon,
        city: response.data.name,
        country: response.data.sys.country,
      };
    }, 60);
  }

  /**
   * Fetch Air Quality Index from WAQI or OpenWeatherMap
   */
  async getAQI(city, lat, lon) {
    const cacheKey = `aqi:${city.toLowerCase()}`;
    
    return cacheService.getOrSet(cacheKey, async () => {
      if (!this.waqiApiKey && !this.openWeatherApiKey) {
        return this.getMockAQI(city);
      }

      try {
        // Try WAQI first
        if (this.waqiApiKey) {
          const url = `https://api.waqi.info/feed/${city}/?token=${this.waqiApiKey}`;
          const response = await axios.get(url);
          
          if (response.data.status === 'ok') {
            const aqi = response.data.data.aqi;
            return {
              aqi: aqi,
              level: this.getAQILevel(aqi),
              components: {
                pm25: response.data.data.iaqi?.pm25?.v || null,
                pm10: response.data.data.iaqi?.pm10?.v || null,
                o3: response.data.data.iaqi?.o3?.v || null,
                no2: response.data.data.iaqi?.no2?.v || null,
              },
              station: response.data.data.city.name,
            };
          }
        }

        // Fallback to OpenWeatherMap Air Pollution API
        if (this.openWeatherApiKey && lat && lon) {
          const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${this.openWeatherApiKey}`;
          const response = await axios.get(url);
          
          const aqi = response.data.list[0].main.aqi * 50; // Convert to US AQI scale
          return {
            aqi: aqi,
            level: this.getAQILevel(aqi),
            components: response.data.list[0].components,
          };
        }
      } catch (error) {
        console.error('AQI fetch error:', error.message);
      }

      return this.getMockAQI(city);
    }, 60);
  }

  /**
   * Get AQI level description
   */
  getAQILevel(aqi) {
    if (aqi <= 50) return { text: 'Good', color: 'green' };
    if (aqi <= 100) return { text: 'Moderate', color: 'yellow' };
    if (aqi <= 150) return { text: 'Unhealthy for Sensitive Groups', color: 'orange' };
    if (aqi <= 200) return { text: 'Unhealthy', color: 'red' };
    if (aqi <= 300) return { text: 'Very Unhealthy', color: 'purple' };
    return { text: 'Hazardous', color: 'maroon' };
  }

  /**
   * Fetch traffic data (using mock data as TomTom requires coordinates)
   */
  async getTraffic(city) {
    const cacheKey = `traffic:${city.toLowerCase()}`;
    
    return cacheService.getOrSet(cacheKey, async () => {
      // Mock traffic data (real implementation would use TomTom Traffic API)
      return this.getMockTraffic(city);
    }, 60);
  }

  /**
   * Fetch news headlines from NewsAPI
   */
  async getNews(city) {
    const cacheKey = `news:${city.toLowerCase()}`;
    
    return cacheService.getOrSet(cacheKey, async () => {
      if (!this.newsApiKey) {
        return this.getMockNews(city);
      }

      const url = `https://newsapi.org/v2/everything?q=${city}&sortBy=publishedAt&pageSize=5&apiKey=${this.newsApiKey}`;
      
      try {
        const response = await this.fetchWithRetry(() => axios.get(url));
        
        return response.data.articles.map(article => ({
          title: article.title,
          description: article.description,
          source: article.source.name,
          url: article.url,
          publishedAt: article.publishedAt,
          image: article.urlToImage,
        }));
      } catch (error) {
        console.error('News fetch error:', error.message);
        return this.getMockNews(city);
      }
    }, 300); // Cache news for 5 minutes
  }

  /**
   * Fetch earthquake data from USGS
   */
  async getEarthquakes(lat, lon) {
    const cacheKey = `earthquakes:${lat},${lon}`;
    
    return cacheService.getOrSet(cacheKey, async () => {
      try {
        const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${lat}&longitude=${lon}&maxradiuskm=500&orderby=time&limit=10`;
        
        const response = await axios.get(url);
        
        return response.data.features.map(feature => ({
          magnitude: feature.properties.mag,
          place: feature.properties.place,
          time: feature.properties.time,
          depth: feature.geometry.coordinates[2],
          distance: this.calculateDistance(
            lat, lon,
            feature.geometry.coordinates[1],
            feature.geometry.coordinates[0]
          ),
        }));
      } catch (error) {
        console.error('Earthquake fetch error:', error.message);
        return [];
      }
    }, 300);
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
  }

  /**
   * Get power outage data (mock implementation)
   */
  async getPowerOutage(city) {
    const cacheKey = `outage:${city.toLowerCase()}`;
    
    return cacheService.getOrSet(cacheKey, async () => {
      return this.getMockPowerOutage(city);
    }, 60);
  }

  /**
   * Aggregate all city data
   */
  async getCityData(city, lat, lon) {
    try {
      const [weather, aqi, traffic, news, earthquakes, powerOutage] = await Promise.allSettled([
        this.getWeather(city),
        this.getAQI(city, lat, lon),
        this.getTraffic(city),
        this.getNews(city),
        this.getEarthquakes(lat, lon),
        this.getPowerOutage(city),
      ]);

      return {
        weather: weather.status === 'fulfilled' ? weather.value : null,
        aqi: aqi.status === 'fulfilled' ? aqi.value : null,
        traffic: traffic.status === 'fulfilled' ? traffic.value : null,
        news: news.status === 'fulfilled' ? news.value : [],
        earthquakes: earthquakes.status === 'fulfilled' ? earthquakes.value : [],
        powerOutage: powerOutage.status === 'fulfilled' ? powerOutage.value : null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error aggregating city data:', error);
      throw error;
    }
  }

  // Mock data generators for development/fallback

  getMockWeather(city) {
    return {
      temperature: Math.round(15 + Math.random() * 20),
      feelsLike: Math.round(15 + Math.random() * 20),
      tempMin: Math.round(10 + Math.random() * 15),
      tempMax: Math.round(20 + Math.random() * 15),
      humidity: Math.round(40 + Math.random() * 40),
      pressure: Math.round(1000 + Math.random() * 30),
      windSpeed: Math.round(Math.random() * 20),
      description: 'partly cloudy',
      icon: '02d',
      city: city,
      country: 'XX',
    };
  }

  getMockAQI(city) {
    const aqi = Math.round(30 + Math.random() * 100);
    return {
      aqi: aqi,
      level: this.getAQILevel(aqi),
      components: {
        pm25: Math.round(10 + Math.random() * 40),
        pm10: Math.round(20 + Math.random() * 60),
        o3: Math.round(30 + Math.random() * 50),
        no2: Math.round(10 + Math.random() * 30),
      },
      station: `${city} Central`,
    };
  }

  getMockTraffic(city) {
    const intensity = ['Low', 'Moderate', 'High', 'Very High'][Math.floor(Math.random() * 4)];
    return {
      intensity: intensity,
      congestionLevel: Math.round(Math.random() * 100),
      averageSpeed: Math.round(20 + Math.random() * 60),
      incidents: Math.floor(Math.random() * 5),
    };
  }

  getMockNews(city) {
    return [
      {
        title: `Latest developments in ${city}`,
        description: 'Major infrastructure project announced...',
        source: 'Local News',
        url: '#',
        publishedAt: new Date().toISOString(),
        image: null,
      },
      {
        title: `${city} weather update`,
        description: 'Meteorologists predict sunny weather...',
        source: 'Weather Channel',
        url: '#',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        image: null,
      },
    ];
  }

  getMockPowerOutage(city) {
    return {
      status: Math.random() > 0.8 ? 'outage' : 'normal',
      affectedAreas: Math.random() > 0.8 ? Math.round(Math.random() * 30) : 0,
      estimatedRestoration: Math.random() > 0.8 ? new Date(Date.now() + 7200000).toISOString() : null,
    };
  }
}

export default new ApiService();
