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

type WindCondition = {
  avgSpeed: number;
  maxSpeed: number;
  minSpeed: number;
  sustainedHighWind: boolean; // true if multiple consecutive periods > threshold
  gusty: boolean;
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

  // Check for sustained high wind (3+ consecutive periods over 12mph)
  let consecutiveHighWind = 0;
  let maxConsecutive = 0;
  for (const speed of avgSpeeds) {
    if (speed > 12) {
      consecutiveHighWind++;
      maxConsecutive = Math.max(maxConsecutive, consecutiveHighWind);
    } else {
      consecutiveHighWind = 0;
    }
  }
  const sustainedHighWind = maxConsecutive >= 3;

  // Gusty if many periods have range differences > 5mph
  const gustyPeriods = speeds.filter((s) => s.max - s.avg > 5).length;
  const gusty = gustyPeriods > periods.length / 3;

  return { avgSpeed, maxSpeed, minSpeed, sustainedHighWind, gusty };
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
function getExcitedOpening(conditions: WindCondition): string {
  const { avgSpeed, sustainedHighWind } = conditions;

  if (sustainedHighWind && avgSpeed > 20) {
    return pickRandom([
      '🔥 EPIC wind day ahead!',
      '⚡ OH YEAH! Major wind incoming!',
      '🌊 GET PUMPED! Gonna be MASSIVE!',
      '💨 WHOA! This is gonna be WILD!',
    ]);
  }

  if (sustainedHighWind && avgSpeed > 15) {
    return pickRandom([
      '🎉 Sweet! Solid wind all day!',
      '🚀 Nice! Gonna be some sick waves out there today!',
      '⛵ Perfect! Sustained wind coming through!',
      '🏄 Excellent! Great conditions ahead!',
    ]);
  }

  if (sustainedHighWind && avgSpeed > 12) {
    return pickRandom([
      '👍 Looking good! Consistent wind today!',
      '✨ Decent! Should be fun out there!',
      '🌊 Not bad! Steady breeze coming in!',
      '⛵ Promising! Nice sailing conditions!',
    ]);
  }

  if (avgSpeed > 12) {
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

  const windVerb =
    avgSpeed > 20
      ? 'howling'
      : avgSpeed > 15
        ? 'cranking'
        : avgSpeed > 10
          ? 'blowing'
          : 'drifting';
  const gustDesc = gusty ? ' with some gnarly gusts' : '';

  if (maxSpeed - minSpeed > 10) {
    return `Wind ${windVerb} ${Math.round(minSpeed)}-${Math.round(maxSpeed)}mph${gustDesc}.`;
  }

  return `Wind ${windVerb} around ${Math.round(avgSpeed)}mph${gustDesc}.`;
}

/** Generate weather context */
function getWeatherContext(weather: string, avgTemp: number): string {
  const tempDesc =
    avgTemp > 75
      ? 'warm'
      : avgTemp > 60
        ? 'comfortable'
        : avgTemp > 45
          ? 'cool'
          : 'chilly';

  const contexts: Record<string, string[]> = {
    rainy: [
      `Watch for rain showers.`,
      `Bring your rain gear!`,
      `Expect some wet conditions.`,
    ],
    stormy: [
      `Thunderstorms possible - stay safe!`,
      `Storms in the forecast.`,
      `Weather looking intense.`,
    ],
    sunny: [
      `${tempDesc} and sunny!`,
      `Beautiful clear skies!`,
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

  if (sustainedHighWind && avgSpeed > 15) {
    return pickRandom([
      'Get out there! 🎯',
      'Time to shred! 🤙',
      'Perfect day to get on the water! 💦',
      "Don't miss this! 🔥",
    ]);
  }

  if (avgSpeed > 12) {
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
 */
export function generateForecastSummary(periods: ForecastPeriod[]): string {
  if (!periods || periods.length === 0) {
    return 'No forecast data available.';
  }

  // Analyze conditions
  const conditions = analyzeWindConditions(periods);
  const weather = getDominantWeather(periods);
  const avgTemp =
    periods.reduce((sum, p) => sum + p.temperature, 0) / periods.length;

  // Build summary
  const parts = [
    getExcitedOpening(conditions),
    getWindDescription(conditions),
    getWeatherContext(weather, avgTemp),
    getActionRecommendation(conditions, weather),
  ];

  return parts.join(' ');
}
