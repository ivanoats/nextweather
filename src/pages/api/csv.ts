/* eslint-disable prefer-const */
import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

import metersPerSecondToMph from '../../util/convert';
import leadingZero from '../../util/leading-zero';
import NWSDateToJSDate from '../../util/nws-date-to-js-date';

// NDBC Realtime2 data format column indices
// #YY  MM DD hh mm WDIR WSPD GST  WVHT   DPD   APD MWD   PRES  ATMP  WTMP  DEWP VIS PTDY  TIDE
const NDBC_COLUMNS = {
  WDIR: 5,   // Wind direction (degrees True)
  WSPD: 6,   // Wind speed (m/s)
  GST: 7,    // Wind gust (m/s)
  ATMP: 13,  // Air temperature (°C)
} as const;
type Observations = {
  stationId?: string;
  windSpeed?: number;
  windDirection?: number;
  windGust?: number;
  airTemp?: number;
  currentTide?: string;
  nextTide?: string;
  nextTideAfter?: string;
};

type Tide = {
  metadata: TideMetadata;
  data: TideDataEntity[]; //| null;
}
type TideMetadata = {
  id: string;
  name: string;
  lat: string;
  lon: string;
}
type TideDataEntity = {
  t: string;
  v: string;
  s: string;
  f: string;
  q: string;
}
type Predictions = {
  predictions: PredictionsEntity[]; //| null;
}
type PredictionsEntity = {
  t: string;
  v: string;
  type: string;
}

type WeatherAPIerror = {
  errors: unknown[];
};

export default async function handler(
  req: NextApiRequest,
  // {
  //   query: {
  //     station: string;
  //     tideStation: string;
  //   };
  // },
  res: NextApiResponse<Observations | WeatherAPIerror>
) {
  // because pushing to an array is mutable
  // eslint-disable prefer-const
  let errors = [];
  let observations: Observations = {};

  const weatherStation = req.query.station || 'WPOW1';
  // NDBC switched from SOS protocol to direct text files
  // See: https://www.ndbc.noaa.gov/data/realtime2/
  const ndbcUri = `https://www.ndbc.noaa.gov/data/realtime2/${weatherStation}.txt`;

  const tideStationId = req.query.tideStation || '9447130';
  const tideUri = `https://tidesandcurrents.noaa.gov/api/datagetter?station=${tideStationId}&product=water_level&datum=mllw&time_zone=lst_ldt&units=english&format=json&date=latest&application=westpointwinddotcom`;

  try {
    // Fetch weather data from NDBC realtime2 text files
    const { data: rawWeatherData } = await axios.get<string>(ndbcUri);
    
    // Parse the space-delimited text file
    // Skip header lines (start with #) and get the first data row (most recent)
    const lines = rawWeatherData.split('\n');
    const dataLines = lines.filter(line => line.trim() && !line.startsWith('#'));
    
    if (dataLines.length === 0) {
      throw new Error('No data available from NDBC');
    }
    
    // First data line is the most recent observation
    const latestData = dataLines[0].trim().split(/\s+/);
    
    // Parse values (MM = missing data)
    const parseValue = (val: string): number | null => {
      return val === 'MM' ? null : Number.parseFloat(val);
    };
    
    observations.stationId = String(weatherStation);
    
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
      observations.airTemp = airTemp;
    }
  } catch (error) {
    errors.push(error);
  }

  try {
    // get current tide level
    const tideResults = await axios.get<Tide>(tideUri);
    const tide = tideResults.data;
    if (tide.data && tide.data.length > 0) {
      const currentTide = tide.data[tide.data.length - 1];
      observations.currentTide = currentTide.v;
    }
  } catch (error) {
    errors.push(error);
  }

  try {
    // get next tide level
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
    if (predictions && predictions.length > 0) {
      const nextTide = `${NWSDateToJSDate(predictions[0].t)} ${
        predictions[0].v
      } ft ${predictions[0].type}`;
      let nextTideAfter;
      if (predictions.length > 1) {
        nextTideAfter = `${NWSDateToJSDate(predictions[1].t)} ${
          predictions[1].v
        } ft ${predictions[1].type}`;
      } else {
        nextTideAfter = 'Unavailable';
      }
      observations.nextTide = nextTide;
      observations.nextTideAfter = nextTideAfter;
    }
  } catch (error) {
    errors.push(error);
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  if (errors.length < 1) {
    res.status(200).json(observations);
  } else {
    console.log(errors);
    res.status(500).json({ errors });
  }
}
