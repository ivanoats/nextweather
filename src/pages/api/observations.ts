import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

interface WeatherValue {
  unitCode: string;
  value: number | null;
  qualityControl: string;
}

interface ObservationProperties {
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

interface ObservationFeature {
  id: string;
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: ObservationProperties;
}

interface ObservationFeatureCollection {
  '@context': (string | object)[];
  type: 'FeatureCollection';
  features: ObservationFeature[];
}

interface SuccessResponse {
  statusCode: 200;
  body: ObservationFeatureCollection;
}

interface ErrorResponse {
  statusCode: 500;
  body: {
    message: string;
    error: {
      name: string;
      message: string;
    };
  };
}

type ObservationResponse = SuccessResponse | ErrorResponse;

const observations = async (
  req: NextApiRequest,
  res: NextApiResponse<ObservationResponse>
) => {
  const station = req.query.station || 'KSEA';
  try {
    const obs = await axios.get(
      `https://api.weather.gov/stations/${station}/observations`
    );
    res.json({
      statusCode: 200,
      body: obs.data,
    });
  } catch (error) {
    const errorDetails = error instanceof Error 
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
