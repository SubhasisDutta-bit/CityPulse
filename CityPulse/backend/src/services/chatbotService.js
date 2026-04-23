/**
 * Analyzes query syntax natively via regex intent detection.
 */
function processQuery(query, intelligenceData) {
  const q = query.toLowerCase();
  
  const intents = {
    safety_check: /safe|outside|run|go out|walk/i,
    weather_check: /weather|rain|umbrella|hot|cold|temperature|snow|sun/i,
    pollution_check: /aqi|pollution|air|breathe|smog|smoke/i,
    general_status: /score|status|condition|how is|city/i
  };

  let matchedIntent = 'general_status';
  for (const [intent, regex] of Object.entries(intents)) {
    if (regex.test(q)) {
      matchedIntent = intent;
      break;
    }
  }

  const { score, conditions, alerts, insights } = intelligenceData;

  let answer = "";
  let reasoning = "";
  let confidence = 0.95;

  switch (matchedIntent) {
    case 'safety_check':
      if (conditions.aqiLevel >= 4) {
        answer = "Air quality is unhealthy. It is not safe for outdoor activity.";
        reasoning = `AQI Index is extremely poor.`;
      } else if (alerts.some(a => a.includes('precipitation') || a.includes('temperature'))) {
        answer = "Conditions are not ideal for going outside right now.";
        reasoning = alerts[0];
      } else if (score > 70) {
        answer = "Yes! It is safe and pleasant to go outside.";
        reasoning = "AQI is acceptable and weather is clear.";
      } else {
        answer = "It is moderately safe, but proceed with caution.";
        reasoning = `City health score is ${score}/100.`;
      }
      break;

    case 'weather_check':
      const isRaining = conditions.weatherType.includes('rain') || conditions.weatherType.includes('snow');
      if (q.includes('umbrella')) {
        answer = isRaining ? "Yes, you should definitely carry an umbrella." : "No umbrella needed right now.";
      } else {
        answer = `Current weather is ${conditions.temperature}°C with ${conditions.weatherType}.`;
      }
      reasoning = "Direct weather API telemetry.";
      break;

    case 'pollution_check':
       if (conditions.aqiLevel <= 2) {
         answer = "Air quality is good right now.";
       } else if (conditions.aqiLevel === 3) {
         answer = "Air quality is moderate. Sensitive groups should take care.";
       } else {
         answer = "Air pollution is currently at hazardous levels.";
       }
       reasoning = `Raw sensor AQI level: ${conditions.aqiLevel}`;
       break;

    case 'general_status':
    default:
      if (score > 80) answer = "The city is currently in optimal condition.";
      else if (score > 50) answer = "The city is experiencing moderate conditions today.";
      else answer = "Overall city conditions are poor today.";

      reasoning = `Computed Health Score is ${score}. ${insights.join(' ')}`;
      break;
  }

  return { answer, reasoning, confidence };
}

module.exports = { processQuery };
