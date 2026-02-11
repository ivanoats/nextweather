import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

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

const getForecastUrl = async (
  lat: number,
  lon: number
): Promise<string> => {
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
  const stationId = String(req.query.station || 'WPOW1');
  const errors: unknown[] = [];

  setCorsHeaders(res);

  try {
    const { lat, lon } = await getStationCoordinates(stationId);
    const forecastUrl = await getForecastUrl(lat, lon);
    const periods = await getHourlyForecast(forecastUrl);

    res.status(200).json({
      stationId,
      latitude: lat,
      longitude: lon,
      periods,
    });
  } catch (error) {
    errors.push(error);
    console.log(errors);
    res.status(500).json({ errors });
  }
}
