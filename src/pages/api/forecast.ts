import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import cache, { CACHE_TTL, generateCacheKey } from '../../util/cache';
import { sanitizeStationId } from '../../util/validate-station-id';

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

export type ForecastResponse = {
  stationId: string;
  latitude: number;
  longitude: number;
  periods: ForecastPeriod[];
};

type ForecastAPIError = {
  errors: unknown[];
};

type NWSPointsResponse = {
  properties: {
    forecastHourly: string;
    gridId: string;
    gridX: number;
    gridY: number;
  };
};

type NWSStationResponse = {
  geometry: {
    type: string;
    coordinates: [number, number]; // [lon, lat]
  };
};

type NWSForecastResponse = {
  properties: {
    periods: Array<{
      startTime: string;
      endTime: string;
      windSpeed: string;
      windDirection: string;
      shortForecast: string;
      temperature: number;
      temperatureUnit: string;
      isDaytime: boolean;
    }>;
  };
};

const NWS_USER_AGENT = 'NextWeather/1.0 (westpointwind.com)';

const getStationCoordinates = async (
  stationId: string
): Promise<{ lat: number; lon: number }> => {
  const { data } = await axios.get<NWSStationResponse>(
    `https://api.weather.gov/stations/${stationId}`,
    { headers: { 'User-Agent': NWS_USER_AGENT } }
  );
  const [lon, lat] = data.geometry.coordinates;
  return { lat, lon };
};

const getForecastUrl = async (lat: number, lon: number): Promise<string> => {
  const { data } = await axios.get<NWSPointsResponse>(
    `https://api.weather.gov/points/${lat},${lon}`,
    { headers: { 'User-Agent': NWS_USER_AGENT } }
  );
  return data.properties.forecastHourly;
};

const getHourlyForecast = async (
  forecastUrl: string
): Promise<ForecastPeriod[]> => {
  const { data } = await axios.get<NWSForecastResponse>(forecastUrl, {
    headers: { 'User-Agent': NWS_USER_AGENT },
  });
  return data.properties.periods.slice(0, 24).map((p) => ({
    startTime: p.startTime,
    endTime: p.endTime,
    windSpeed: p.windSpeed,
    windDirection: p.windDirection,
    shortForecast: p.shortForecast,
    temperature: p.temperature,
    temperatureUnit: p.temperatureUnit,
    isDaytime: p.isDaytime,
  }));
};

const setCorsHeaders = (res: NextApiResponse): void => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ForecastResponse | ForecastAPIError>
) {
  // Sanitize user input to prevent SSRF attacks (CWE-918)
  // Only allow alphanumeric station IDs to prevent path traversal and URL injection
  const stationId = sanitizeStationId(
    req.query.station as string | undefined,
    'WPOW1'
  );
  const errors: unknown[] = [];

  // Generate cache key based on station parameter
  const cacheKey = generateCacheKey('forecast', { station: stationId });

  // Check cache first
  const cachedData = cache.get<ForecastResponse>(cacheKey);
  if (cachedData) {
    setCorsHeaders(res);
    // Add cache hit header for debugging
    res.setHeader('X-Cache', 'HIT');
    res.status(200).json(cachedData);
    return;
  }

  setCorsHeaders(res);

  try {
    const { lat, lon } = await getStationCoordinates(stationId);
    const forecastUrl = await getForecastUrl(lat, lon);
    const periods = await getHourlyForecast(forecastUrl);

    const response: ForecastResponse = {
      stationId,
      latitude: lat,
      longitude: lon,
      periods,
    };

    // Cache successful response
    cache.set(cacheKey, response, CACHE_TTL.FORECAST);
    // Add cache miss header for debugging
    res.setHeader('X-Cache', 'MISS');
    // Add Cache-Control header for HTTP caching
    res.setHeader(
      'Cache-Control',
      `public, max-age=${CACHE_TTL.FORECAST}, s-maxage=${CACHE_TTL.FORECAST}`
    );
    res.status(200).json(response);
  } catch (err: any) {
    const errorMessage = err?.message || 'Internal error';
    errors.push(errorMessage);
    console.log(errors);
    res.status(500).json({ errors });
  }
}
