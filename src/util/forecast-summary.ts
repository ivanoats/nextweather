/**
 * Generate natural language summaries for wind forecasts
 *
 * This uses a template-based approach with conditional logic - no LLM required!
 * Benefits:
 * - Completely free (no API costs)
 * - Instant response (no network latency)
 * - Predictable and reliable
 * - Easy to customize messages
 *
 * Alternative LLM options if needed:
 * - OpenAI GPT-3.5 Turbo: ~$0.0015 per summary (cheap but not free)
 * - Anthropic Claude Haiku: ~$0.0001 per summary (very cheap)
 * - Hugging Face Inference API: Free tier available, limited rate
 * - Local models (Ollama): Free but requires setup/hosting
 */

// Wind speed thresholds (mph)
const WIND_THRESHOLD_LOW = 10;
const WIND_THRESHOLD_MODERATE = 12;
const WIND_THRESHOLD_HIGH = 15;
const WIND_THRESHOLD_EPIC = 20;

// Wind analysis thresholds
const MIN_CONSECUTIVE_PERIODS_SUSTAINED = 3;
const GUST_RANGE_THRESHOLD = 5;
const WIND_SPEED_VARIANCE_THRESHOLD = 10;

// Temperature thresholds (Fahrenheit)
const TEMP_WARM = 75;
const TEMP_COMFORTABLE = 60;
const TEMP_COOL = 45;

export type ForecastPeriod = {
  startTime: string;
  endTime: string;
  windSpeed: string;
  windDirection: string;
  shortForecast: string;
  temperature: number;
  temperatureUnit: string;
  isDaytime: boolean;
};

export type CurrentConditions = {
  windSpeed?: number;
  windGust?: number;
  windDirection?: number;
};

type WindCondition = {
  avgSpeed: number;
  maxSpeed: number;
  minSpeed: number;
  sustainedHighWind: boolean; // true if multiple consecutive periods > threshold
  gusty: boolean;
};

type ForecastComparison = {
  isCurrentStronger: boolean; // current wind > forecast average
  isForecastStronger: boolean; // forecast wind > current average by significant margin
  isSimilar: boolean; // current wind ~ forecast average
  currentSpeed: number;
  forecastAvg: number;
};

/** Helper to pick random item from array */
function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/** Parse wind speed string like "10 mph" or "10-15 mph" to get average and max */
function parseWindSpeed(ws: string): { avg: number; max: number } {
  const numbers = ws.match(/(\d+)(?:-(\d+))?/);
  if (!numbers) return { avg: 0, max: 0 };

  const first = Number.parseInt(numbers[1], 10);
  const second = numbers[2] ? Number.parseInt(numbers[2], 10) : first;

  return {
    avg: first,
    max: second,
  };
}

/** Analyze wind conditions from forecast periods */
function analyzeWindConditions(periods: ForecastPeriod[]): WindCondition {
  const speeds = periods.map((p) => parseWindSpeed(p.windSpeed));
  const avgSpeeds = speeds.map((s) => s.avg);
  const maxSpeeds = speeds.map((s) => s.max);

  const avgSpeed = avgSpeeds.reduce((sum, s) => sum + s, 0) / avgSpeeds.length;
  const maxSpeed = Math.max(...maxSpeeds);
  const minSpeed = Math.min(...avgSpeeds);

  // Check for sustained high wind (3+ consecutive periods over threshold)
  let consecutiveHighWind = 0;
  let maxConsecutive = 0;
  for (const speed of avgSpeeds) {
    if (speed > WIND_THRESHOLD_MODERATE) {
      consecutiveHighWind++;
      maxConsecutive = Math.max(maxConsecutive, consecutiveHighWind);
    } else {
      consecutiveHighWind = 0;
    }
  }
  const sustainedHighWind = maxConsecutive >= MIN_CONSECUTIVE_PERIODS_SUSTAINED;

  // Gusty if many periods have range differences > threshold
  const gustyPeriods = speeds.filter(
    (s) => s.max - s.avg > GUST_RANGE_THRESHOLD
  ).length;
  const gusty = gustyPeriods > periods.length / 3;

  return { avgSpeed, maxSpeed, minSpeed, sustainedHighWind, gusty };
}

/** Compare current conditions with forecast to avoid over-excitement */
function compareForecastWithCurrent(
  forecastConditions: WindCondition,
  currentConditions?: CurrentConditions
): ForecastComparison | null {
  if (currentConditions?.windSpeed == null) {
    return null;
  }

  const currentSpeed = currentConditions.windSpeed;
  const forecastAvg = forecastConditions.avgSpeed;
  const difference = forecastAvg - currentSpeed;

  // Define thresholds for comparison
  const SIGNIFICANT_DIFFERENCE = 5; // More than 5 mph difference is significant
  const SIMILAR_THRESHOLD = SIGNIFICANT_DIFFERENCE; // Within 5 mph is considered similar

  const isCurrentStronger = difference < -SIGNIFICANT_DIFFERENCE; // forecast < current by more than 5 mph
  const isForecastStronger = difference > SIGNIFICANT_DIFFERENCE; // forecast > current by more than 5 mph
  const isSimilar = Math.abs(difference) <= SIMILAR_THRESHOLD;

  return {
    isCurrentStronger,
    isForecastStronger,
    isSimilar,
    currentSpeed,
    forecastAvg,
  };
}

/** Get dominant weather condition from periods */
function getDominantWeather(periods: ForecastPeriod[]): string {
  const forecasts = periods.map((p) => p.shortForecast.toLowerCase());

  // Check for rain/storms
  if (forecasts.some((f) => f.includes('rain') || f.includes('shower')))
    return 'rainy';
  if (forecasts.some((f) => f.includes('thunder') || f.includes('storm')))
    return 'stormy';
  if (forecasts.some((f) => f.includes('snow'))) return 'snowy';

  // Check for clear vs cloudy
  const clearCount = forecasts.filter(
    (f) => f.includes('sunny') || f.includes('clear') || f === 'fair'
  ).length;
  const cloudyCount = forecasts.filter(
    (f) => f.includes('cloud') || f.includes('overcast')
  ).length;

  if (clearCount > periods.length / 2) return 'sunny';
  if (cloudyCount > periods.length / 2) return 'cloudy';

  return 'mixed';
}

/** Generate excited opening based on wind conditions */
function getExcitedOpening(
  conditions: WindCondition,
  comparison: ForecastComparison | null
): string {
  const { avgSpeed, sustainedHighWind } = conditions;

  // If current conditions are already stronger than forecast, tone it down
  if (comparison?.isCurrentStronger) {
    if (avgSpeed > WIND_THRESHOLD_HIGH) {
      return pickRandom([
        '💨 Still looking solid ahead!',
        '🌊 Conditions holding steady!',
        '⛵ Should stay pretty good!',
        '👍 Wind staying consistent!',
      ]);
    }
    if (avgSpeed > WIND_THRESHOLD_MODERATE) {
      return pickRandom([
        '😊 Currently better than forecast!',
        '✨ Enjoy it while it lasts!',
        '🌬️ Making the most of current conditions!',
      ]);
    }
    // Forecast predicts lighter than current light wind
    return pickRandom([
      '🍃 Wind might ease up.',
      '😌 Expecting lighter breeze ahead.',
      '🛶 Could mellow out later.',
    ]);
  }

  // If current is similar to forecast, emphasize steady conditions
  if (comparison?.isSimilar && sustainedHighWind) {
    if (avgSpeed > WIND_THRESHOLD_HIGH) {
      return pickRandom([
        '🎯 Steady strong wind all day!',
        '⛵ Consistent solid conditions!',
        '🌊 Staying steady and strong!',
      ]);
    }
    return pickRandom([
      '👌 Nice and steady today!',
      '✨ Consistent breeze throughout!',
      '🌬️ Holding steady!',
    ]);
  }

  // Original excitement levels for improving or no current data
  if (sustainedHighWind && avgSpeed > WIND_THRESHOLD_EPIC) {
    return pickRandom([
      '🔥 EPIC wind day ahead!',
      '⚡ OH YEAH! Major wind incoming!',
      '🌊 GET PUMPED! Gonna be MASSIVE!',
      '💨 WHOA! This is gonna be WILD!',
    ]);
  }

  if (sustainedHighWind && avgSpeed > WIND_THRESHOLD_HIGH) {
    return pickRandom([
      '🎉 Sweet! Solid wind all day!',
      '🚀 Nice! Gonna be some sick waves out there today!',
      '⛵ Perfect! Sustained wind coming through!',
      '🏄 Excellent! Great conditions ahead!',
    ]);
  }

  if (sustainedHighWind && avgSpeed > WIND_THRESHOLD_MODERATE) {
    return pickRandom([
      '👍 Looking good! Consistent wind today!',
      '✨ Decent! Should be fun out there!',
      '🌊 Not bad! Steady breeze coming in!',
      '⛵ Promising! Nice sailing conditions!',
    ]);
  }

  if (avgSpeed > WIND_THRESHOLD_MODERATE) {
    return pickRandom([
      '👌 Some nice puffs expected!',
      '🌬️ Wind picking up at times!',
      '⛵ Moderate conditions ahead!',
    ]);
  }

  // Light wind
  return pickRandom([
    '😌 Light and easy today.',
    '🍃 Gentle breeze ahead.',
    '🛶 Mellow conditions expected.',
  ]);
}

/** Generate wind description */
function getWindDescription(conditions: WindCondition): string {
  const { avgSpeed, maxSpeed, minSpeed, gusty } = conditions;

  let windVerb = 'drifting';
  if (avgSpeed > WIND_THRESHOLD_EPIC) {
    windVerb = 'howling';
  } else if (avgSpeed > WIND_THRESHOLD_HIGH) {
    windVerb = 'cranking';
  } else if (avgSpeed > WIND_THRESHOLD_LOW) {
    windVerb = 'blowing';
  }

  const gustDesc = gusty ? ' with some gnarly gusts' : '';

  if (maxSpeed - minSpeed > WIND_SPEED_VARIANCE_THRESHOLD) {
    return `Wind ${windVerb} ${Math.round(minSpeed)}-${Math.round(maxSpeed)}mph${gustDesc}.`;
  }

  return `Wind ${windVerb} around ${Math.round(avgSpeed)}mph${gustDesc}.`;
}

/** Generate weather context */
function getWeatherContext(weather: string, avgTemp: number): string {
  let tempDesc = 'chilly';
  if (avgTemp > TEMP_WARM) {
    tempDesc = 'warm';
  } else if (avgTemp > TEMP_COMFORTABLE) {
    tempDesc = 'comfortable';
  } else if (avgTemp > TEMP_COOL) {
    tempDesc = 'cool';
  }

  const contexts: Record<string, string[]> = {
    rainy: [
      'Watch for rain showers.',
      'Bring your rain gear!',
      'Expect some wet conditions.',
    ],
    stormy: [
      'Thunderstorms possible - stay safe!',
      'Storms in the forecast.',
      'Weather looking intense.',
    ],
    sunny: [
      `${tempDesc} and sunny!`,
      'Beautiful clear skies!',
      `Perfect ${tempDesc} weather!`,
    ],
    cloudy: [
      `${tempDesc} with clouds.`,
      `Overcast but ${tempDesc}.`,
      `Gray skies, ${tempDesc} temps.`,
    ],
    mixed: [
      `${tempDesc} with varied conditions.`,
      `Mixed weather, ${tempDesc} overall.`,
    ],
  };

  const options = contexts[weather] || contexts.mixed;
  return pickRandom(options);
}

/** Generate action recommendation based on conditions */
function getActionRecommendation(
  conditions: WindCondition,
  weather: string
): string {
  const { avgSpeed, sustainedHighWind } = conditions;

  if (weather === 'stormy') {
    return '⚠️ Check conditions before heading out.';
  }

  if (sustainedHighWind && avgSpeed > WIND_THRESHOLD_HIGH) {
    return pickRandom([
      'Get out there! 🎯',
      'Time to shred! 🤙',
      'Perfect day to get on the water! 💦',
      "Don't miss this! 🔥",
    ]);
  }

  if (avgSpeed > WIND_THRESHOLD_MODERATE) {
    return pickRandom([
      'Should be a fun session! 🌊',
      'Good day for some action! ⛵',
      'Decent conditions to play in! 🏄',
    ]);
  }

  return pickRandom([
    'Good for cruising. 🛶',
    'Nice for a relaxed paddle. 🚣',
    'Perfect for beginners! 👍',
  ]);
}

/**
 * Generate a natural language summary of the forecast
 * Focuses on wind conditions for water sports enthusiasts
 *
 * @param periods - Array of forecast periods from NWS API
 * @param currentConditions - Optional current wind conditions to compare against forecast
 */
export function generateForecastSummary(
  periods: ForecastPeriod[],
  currentConditions?: CurrentConditions
): string {
  if (!periods || periods.length === 0) {
    return 'No forecast data available.';
  }

  // Analyze conditions
  const conditions = analyzeWindConditions(periods);
  const comparison = compareForecastWithCurrent(conditions, currentConditions);
  const weather = getDominantWeather(periods);
  const avgTemp =
    periods.reduce((sum, p) => sum + p.temperature, 0) / periods.length;

  // Build summary
  const parts = [
    getExcitedOpening(conditions, comparison),
    getWindDescription(conditions),
    getWeatherContext(weather, avgTemp),
    getActionRecommendation(conditions, weather),
  ];

  return parts.join(' ');
}
