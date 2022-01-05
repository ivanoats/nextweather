/* eslint-disable prefer-const */
import axios from 'axios';
import { parse } from 'csv-parse/sync';
import type { NextApiRequest, NextApiResponse } from 'next';

import metersPerSecondToMph from '../../util/convert';
import leadingZero from '../../util/leading-zero';
import NWSDateToJSDate from '../../util/nws-date-to-js-date';

interface WeatherDataRow {
  station_id: string;
  sensor_id: string;
  'latitude (degree)': string;
  'longitude (degree)': string;
  date_time: string;
  'depth (m)': string;
  'wind_from_direction (degree)': string;
  'wind_speed (m/s)': string;
  'wind_speed_of_gust (m/s)': string;
  'upward_air_velocity (m/s)': string;
}
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

interface Tide {
  metadata: TideMetadata;
  data: TideDataEntity[]; //| null;
}
interface TideMetadata {
  id: string;
  name: string;
  lat: string;
  lon: string;
}
interface TideDataEntity {
  t: string;
  v: string;
  s: string;
  f: string;
  q: string;
}
interface Predictions {
  predictions: PredictionsEntity[]; //| null;
}
interface PredictionsEntity {
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
  let rawWindData = '';
  let rawTempData = '';

  const weatherStation = req.query.station || 'WPOW1';
  const uri = 'https://sdf.ndbc.noaa.gov/sos/server.php';

  const tideStationId = req.query.tideStation || '9447130';
  const tideUri = `https://tidesandcurrents.noaa.gov/api/datagetter?station=${tideStationId}&product=water_level&datum=mllw&time_zone=lst_ldt&units=english&format=json&date=latest&application=westpointwinddotcom`;

  try {
    const { data } = await axios.get<string>(uri, {
      params: {
        request: 'GetObservation',
        service: 'SOS',
        version: '1.0.0',
        offering: `urn:ioos:station:wmo:${weatherStation}`,
        observedproperty: 'winds',
        responseformat: 'text/csv',
        // alternative response formats to play with:
        // responseformat: "application/ioos+xml;version=0.6.1",
        // responseformat: "application/vnd.google-earth.kml+xml",
        eventtime: 'latest',
      },
    });
    rawWindData = data;
  } catch (error) {
    errors.push(error);
  }
  try {
    const records: Array<WeatherDataRow> = parse(rawWindData, {
      columns: true,
    });
    const weatherData = records[0];

    observations.stationId = weatherData.station_id;
    observations.windSpeed = metersPerSecondToMph(
      parseInt(weatherData['wind_speed (m/s)'])
    );
    observations.windDirection = parseInt(
      weatherData['wind_from_direction (degree)']
    );
    observations.windGust = metersPerSecondToMph(
      parseInt(weatherData['wind_speed_of_gust (m/s)'])
    );
  } catch (error) {
    errors.push(error);
  }
  try {
    // get temperature
    const { data } = await axios.get<string>(uri, {
      params: {
        request: 'GetObservation',
        service: 'SOS',
        version: '1.0.0',
        offering: `urn:ioos:station:wmo:${weatherStation}`,
        observedProperty: 'air_temperature',
        responseformat: 'text/csv',
        eventtime: 'latest',
      },
    });
    rawTempData = data;
  } catch (error) {
    errors.push(error);
  }
  try {
    const tempData = parse(rawTempData, {
      columns: true,
    })[0];
    observations.airTemp = parseInt(tempData['air_temperature (C)']);
  } catch (error) {
    errors.push(error);
  }

  try {
    // get current tide level
    const tideResults = await axios.get<Tide>(tideUri);
    const tide = tideResults.data;
    const currentTide = tide.data[tide.data.length - 1];
    observations.currentTide = currentTide.v;
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
