import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

interface ObservationResponse {
  statusCode: number;
  body: any;
}

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
    res.json({
      statusCode: 500,
      body: error,
    });
  }
};

export default observations;
