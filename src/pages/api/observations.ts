import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import cache, { CACHE_TTL, generateCacheKey } from '../../util/cache';

export interface WeatherValue {
  unitCode: string;
  value: number | null;
  qualityControl: string;
}

export interface ObservationProperties {
  '@id': string;
  '@type': string;
  elevation: WeatherValue;
  station: string;
  stationId?: string;
  stationName?: string;
  timestamp: string;
  rawMessage: string;
  textDescription: string;
  icon: string | null;
  presentWeather: unknown[];
  temperature: WeatherValue;
  dewpoint: WeatherValue;
  windDirection: WeatherValue;
  windSpeed: WeatherValue;
  windGust: WeatherValue;
  barometricPressure?: WeatherValue;
  seaLevelPressure?: WeatherValue;
  visibility?: WeatherValue;
  maxTemperatureLast24Hours?: WeatherValue;
  minTemperatureLast24Hours?: WeatherValue;
  precipitationLastHour?: WeatherValue;
  precipitationLast3Hours?: WeatherValue;
  precipitationLast6Hours?: WeatherValue;
  relativeHumidity?: WeatherValue;
  windChill?: WeatherValue;
  heatIndex?: WeatherValue;
  cloudLayers?: unknown;
}

export interface ObservationFeature {
  id: string;
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: ObservationProperties;
}

/**
 * NWS observation response following GeoJSON-LD format.
 * @see https://geojson.org/geojson-ld/ for GeoJSON-LD specification
 */
export interface ObservationFeatureCollection {
  '@context': (string | object)[];
  type: 'FeatureCollection';
  features: ObservationFeature[];
}

export interface SuccessResponse {
  statusCode: 200;
  body: ObservationFeatureCollection;
}

export interface ErrorResponse {
  statusCode: 500;
  body: {
    message: string;
    error: {
      name: string;
      message: string;
    };
  };
}

export type ObservationResponse = SuccessResponse | ErrorResponse;

const observations = async (
  req: NextApiRequest,
  res: NextApiResponse<ObservationResponse>
) => {
  const station = String(req.query.station || 'KSEA');

  // Generate cache key based on station parameter
  const cacheKey = generateCacheKey('observations', { station });

  // Check cache first
  const cachedData = cache.get<SuccessResponse>(cacheKey);
  if (cachedData) {
    // Add cache hit header for debugging
    res.setHeader('X-Cache', 'HIT');
    res.json(cachedData);
    return;
  }

  try {
    const obs = await axios.get(
      `https://api.weather.gov/stations/${station}/observations`
    );

    const response: SuccessResponse = {
      statusCode: 200,
      body: obs.data,
    };

    // Cache successful response
    cache.set(cacheKey, response, CACHE_TTL.OBSERVATIONS);
    // Add cache miss header for debugging
    res.setHeader('X-Cache', 'MISS');
    // Add Cache-Control header for HTTP caching
    res.setHeader(
      'Cache-Control',
      `public, max-age=${CACHE_TTL.OBSERVATIONS}, s-maxage=${CACHE_TTL.OBSERVATIONS}`
    );
    res.json(response);
  } catch (error) {
    const errorDetails =
      error instanceof Error
        ? { name: error.name, message: error.message }
        : { name: 'UnknownError', message: 'An error occurred' };

    res.json({
      statusCode: 500,
      body: {
        message: errorDetails.message,
        error: errorDetails,
      },
    });
  }
};

export default observations;
