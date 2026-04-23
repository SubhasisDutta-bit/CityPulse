const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60 });
const { getWeather } = require('./weatherService');
const { getAQI } = require('./aqiService');
const { getNews } = require('./newsService');

/**
 * Aggregates all CityPulse telemetry and synthesizes a City Health Score.
 */
async function getIntelligence(city) {
  const cacheKey = `intel_${city.toLowerCase()}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) return cachedData;

  try {
    const [weather, aqi, news] = await Promise.all([
      getWeather(city).catch(() => null),
      getAQI(city).catch(() => null),
      getNews(city).catch(() => null)
    ]);

    if (!weather) throw new Error('Core weather data is required to run intelligence.');

    // Heuristic Score Calculation
    let score = 100;
    const aqiLevel = aqi?.aqi || 2;
    const isRaining = weather.description.toLowerCase().includes('rain') || weather.description.toLowerCase().includes('snow');
    const extremeTemp = weather.temperature > 35 || weather.temperature < 0;

    if (aqiLevel >= 5) score -= 40;
    else if (aqiLevel === 4) score -= 30;
    else if (aqiLevel === 3) score -= 15;

    if (isRaining) score -= 20;
    if (extremeTemp) score -= 15;
    
    // Determine Sentiment naively by looking at news titles
    let sentiment = 'neutral';
    if (news && news.articles && news.articles.length > 0) {
      const allText = news.articles.map(a => a.title).join(' ').toLowerCase();
      const negativeWords = ['crisis', 'crash', 'dead', 'kill', 'warning', 'bad', 'drop', 'danger'];
      const positiveWords = ['boom', 'surge', 'good', 'cure', 'win', 'safe', 'growth'];
      
      let negCount = negativeWords.filter(w => allText.includes(w)).length;
      let posCount = positiveWords.filter(w => allText.includes(w)).length;
      
      if (negCount > posCount) { sentiment = 'negative'; score -= 10; }
      if (posCount > negCount) { sentiment = 'positive'; score += 5; }
    }

    // Cap
    score = Math.max(0, Math.min(100, score));

    // Gen alerts
    const alerts = [];
    if (aqiLevel >= 4) alerts.push('Hazardous air quality detected.');
    if (extremeTemp) alerts.push('Extreme temperatures detected.');
    if (isRaining) alerts.push('Active precipitation.');

    let insights = [];
    if (score > 80) insights.push('Optimal conditions for outdoor activity.');
    if (score < 50) insights.push('Conditions are currently poor. Limit outdoor exposure.');

    const result = {
      score,
      conditions: {
        aqiLevel,
        weatherType: weather.description,
        temperature: weather.temperature,
        sentiment
      },
      insights,
      alerts
    };

    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Intelligence Service Error:', error);
    throw error;
  }
}

module.exports = { getIntelligence };
