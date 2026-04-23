const axios = require('axios');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60 });

const getMockNewsData = (city) => {
  return {
    isMock: true,
    articles: [
      {
        title: `Mayor of ${city} announces new smart-city initiative regarding public transit integration.`,
        source: 'CityPulse Metro',
        url: '#',
      },
      {
        title: `Local tech sector sees unprecedented growth in Q3.`,
        source: 'Tech Daily',
        url: '#',
      },
      {
        title: `Upcoming cultural festival in ${city} expected to draw record crowds.`,
        source: 'Global Times',
        url: '#',
      }
    ],
    timestamp: new Date().toISOString()
  };
};

const getNews = async (city) => {
  const cacheKey = `news_${city.toLowerCase()}`;
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey || apiKey === 'YOUR_NEWS_API_KEY') {
    const mock = getMockNewsData(city);
    cache.set(cacheKey, mock);
    return mock;
  }

  try {
    const response = await axios.get(`https://newsapi.org/v2/everything?q=${encodeURIComponent(city)}&sortBy=publishedAt&language=en&pageSize=3&apiKey=${apiKey}`);
    
    const formattedArticles = response.data.articles.map(article => ({
      title: article.title,
      source: article.source.name,
      url: article.url
    }));

    const result = {
      articles: formattedArticles,
      timestamp: new Date().toISOString()
    };

    cache.set(cacheKey, result);
    return result;

  } catch (error) {
    console.error(`Error fetching news for ${city}:`, error.message);
    if (error.response && error.response.status === 401) {
      const mockResult = getMockNewsData(city);
      cache.set(cacheKey, mockResult);
      return mockResult;
    }
    throw error;
  }
};

module.exports = {
  getNews
};
