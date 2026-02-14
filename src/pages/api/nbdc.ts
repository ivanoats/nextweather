import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

import metersPerSecondToMph, { celsiusToFahrenheit } from '../../util/convert';
import leadingZero from '../../util/leading-zero';
import NWSDateToJSDate from '../../util/nws-date-to-js-date';
import cache, { CACHE_TTL, generateCacheKey } from '../../util/cache';
import { sanitizeStationId } from '../../util/validate-station-id';

// NDBC Realtime2 data format column indices
// #YY  MM DD hh mm WDIR WSPD GST  WVHT   DPD   APD MWD   PRES  ATMP  WTMP  DEWP VIS PTDY  TIDE
const NDBC_COLUMNS = {
  WDIR: 5, // Wind direction (degrees True)
  WSPD: 6, // Wind speed (m/s)
  GST: 7, // Wind gust (m/s)
  ATMP: 13, // Air temperature (°C)
} as const;
export type Observations = {
  stationId?: string;
  windSpeed?: number;
  windDirection?: number;
  windGust?: number;
  airTemp?: number;
  currentTide?: string;
  nextTide?: string;
  nextTideAfter?: string;
};

export type Tide = {
  metadata: TideMetadata;
  data: TideDataEntity[]; //| null;
};
export type TideMetadata = {
  id: string;
  name: string;
  lat: string;
  lon: string;
};
export type TideDataEntity = {
  t: string;
  v: string;
  s: string;
  f: string;
  q: string;
};
export type Predictions = {
  predictions: PredictionsEntity[]; //| null;
};
export type PredictionsEntity = {
  t: string;
  v: string;
  type: string;
};

export type WeatherAPIerror = {
  errors: unknown[];
};

const parseValue = (val: string): number | null => {
  return val === 'MM' ? null : Number.parseFloat(val);
};

const parseNdbcObservations = (
  weatherStation: string,
  rawWeatherData: string
): Observations => {
  const lines = rawWeatherData.split('\n');
  const dataLines = lines.filter(
    (line) => line.trim() && !line.startsWith('#')
  );

  if (dataLines.length === 0) {
    throw new Error('No data available from NDBC');
  }

  const latestData = dataLines[0].trim().split(/\s+/);
  const observations: Observations = {
    stationId: String(weatherStation),
  };

  const windSpeed = parseValue(latestData[NDBC_COLUMNS.WSPD]);
  if (windSpeed !== null) {
    observations.windSpeed = metersPerSecondToMph(windSpeed);
  }

  const windDir = parseValue(latestData[NDBC_COLUMNS.WDIR]);
  if (windDir !== null) {
    observations.windDirection = windDir;
  }

  const windGust = parseValue(latestData[NDBC_COLUMNS.GST]);
  if (windGust !== null) {
    observations.windGust = metersPerSecondToMph(windGust);
  }

  const airTemp = parseValue(latestData[NDBC_COLUMNS.ATMP]);
  if (airTemp !== null) {
    observations.airTemp = celsiusToFahrenheit(airTemp);
  }

  return observations;
};

const getCurrentTide = async (tideUri: string): Promise<string | undefined> => {
  const tideResults = await axios.get<Tide>(tideUri);
  const tide = tideResults.data;

  if (tide.data && tide.data.length > 0) {
    const currentTide = tide.data[tide.data.length - 1];
    return currentTide.v;
  }

  return undefined;
};

const getNextTides = async (
  tideStationId: string
): Promise<{ nextTide?: string; nextTideAfter?: string }> => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDay = tomorrow.getDate();
  const tomorrowMonth = tomorrow.getMonth() + 1;
  const formattedTomorrowMonth = leadingZero(tomorrowMonth);
  const formattedTomorrowDay = leadingZero(tomorrowDay);

  const year = today.getFullYear();
  const day = today.getDate();
  const formattedDay = leadingZero(day);

  const month = today.getMonth() + 1;
  const formattedMonth = leadingZero(month);
  const beginDate = `${year}${formattedMonth}${formattedDay}`;
  const endDate = `${year}${formattedTomorrowMonth}${formattedTomorrowDay}`;

  const predictionsUri = `https://tidesandcurrents.noaa.gov/api/datagetter?product=predictions&application=westpointwinddotcom&begin_date=${beginDate}&end_date=${endDate}&datum=MLLW&station=${tideStationId}&time_zone=lst_ldt&units=english&interval=hilo&format=json`;

  const predictionsJSON = await axios.get<Predictions>(predictionsUri);
  const predictions = predictionsJSON.data.predictions;

  if (!predictions || predictions.length === 0) {
    return {};
  }

  const nextTide = `${NWSDateToJSDate(predictions[0].t)} ${
    predictions[0].v
  } ft ${predictions[0].type}`;
  const nextTideAfter =
    predictions.length > 1
      ? `${NWSDateToJSDate(predictions[1].t)} ${
          predictions[1].v
        } ft ${predictions[1].type}`
      : 'Unavailable';

  return { nextTide, nextTideAfter };
};

const fetchWeatherData = async (
  weatherStation: string,
  ndbcUri: string
): Promise<Observations> => {
  const { data: rawWeatherData } = await axios.get<string>(ndbcUri);
  return parseNdbcObservations(weatherStation, rawWeatherData);
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
  res: NextApiResponse<Observations | WeatherAPIerror>
) {
  // Sanitize user input to prevent SSRF attacks (CWE-918)
  // Only allow alphanumeric station IDs to prevent path traversal and URL injection
  const weatherStation = sanitizeStationId(
    req.query.station as string | undefined,
    'WPOW1'
  );
  const tideStationId = sanitizeStationId(
    req.query.tideStation as string | undefined,
    '9447130'
  );

  // Generate cache key based on station parameters
  const cacheKey = generateCacheKey('nbdc', {
    station: weatherStation,
    tideStation: tideStationId,
  });

  // Check cache first
  const cachedData = cache.get<Observations>(cacheKey);
  if (cachedData) {
    setCorsHeaders(res);
    // Add cache hit header for debugging
    res.setHeader('X-Cache', 'HIT');
    res.status(200).json(cachedData);
    return;
  }

  // NDBC switched from SOS protocol to direct text files
  // See: https://www.ndbc.noaa.gov/data/realtime2/
  const ndbcUri = `https://www.ndbc.noaa.gov/data/realtime2/${weatherStation}.txt`;
  const tideUri = `https://tidesandcurrents.noaa.gov/api/datagetter?station=${tideStationId}&product=water_level&datum=mllw&time_zone=lst_ldt&units=english&format=json&date=latest&application=westpointwinddotcom`;

  // Run all API calls in parallel and collect results/errors
  const [weatherResult, currentTideResult, nextTidesResult] =
    await Promise.allSettled([
      fetchWeatherData(weatherStation, ndbcUri),
      getCurrentTide(tideUri),
      getNextTides(tideStationId),
    ]);

  const errors: unknown[] = [];
  let observations: Observations = {};

  if (weatherResult.status === 'fulfilled') {
    observations = { ...observations, ...weatherResult.value };
  } else {
    errors.push(weatherResult.reason);
  }

  if (currentTideResult.status === 'fulfilled') {
    observations.currentTide = currentTideResult.value;
  } else {
    errors.push(currentTideResult.reason);
  }

  if (nextTidesResult.status === 'fulfilled') {
    observations.nextTide = nextTidesResult.value.nextTide;
    observations.nextTideAfter = nextTidesResult.value.nextTideAfter;
  } else {
    errors.push(nextTidesResult.reason);
  }

  setCorsHeaders(res);

  if (errors.length === 0) {
    // Cache successful response
    cache.set(cacheKey, observations, CACHE_TTL.NBDC);
    // Add cache miss header for debugging
    res.setHeader('X-Cache', 'MISS');
    // Add Cache-Control header for HTTP caching
    res.setHeader(
      'Cache-Control',
      `public, max-age=${CACHE_TTL.NBDC}, s-maxage=${CACHE_TTL.NBDC}`
    );
    res.status(200).json(observations);
  } else {
    console.log(errors);
    res.status(500).json({ errors });
  }
}
