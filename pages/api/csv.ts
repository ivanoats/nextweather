import got from 'got';
import parse from 'csv-parse/lib/sync';
import { metersPerSecondToMph} from '../../util/convert';
/**
 * @param {{ query: { station: string; }; }} req
 * @param {{ json: (arg0: { statusCode: number; body: any; }) => void; }} res
 */
export default async function handler(req, res) {
  const station = req.query.station || 'WPOW1'
   try {
    // @ts-ignore
    const {body} = await got(`https://sdf.ndbc.noaa.gov/sos/server.php`,{
      searchParams: {
        request: "GetObservation",
        service: "SOS",
        version: "1.0.0",
        offering: `urn:ioos:station:wmo:${station}`,
        observedproperty: "winds",
        responseformat: "text/csv",
        // responseformat: "application/ioos+xml;version=0.6.1",
        // responseformat: "application/vnd.google-earth.kml+xml",
        eventtime: "latest"
      }
    })
    const records = parse(body, {
      columns: true
    })
    console.log(records)

    const weatherData = records[0]

    const weatherConditions = {
      stationId: weatherData.station_id,
      windSpeed: metersPerSecondToMph(parseInt(weatherData['wind_speed (m/s)'])),
      windDirection: parseInt(weatherData['wind_from_direction (degree)']),
      windGust: metersPerSecondToMph(parseInt(weatherData['wind_speed_of_gust (m/s)']))
    }

    res.json({
      statusCode: 200,
      weatherConditions
    })
  
  } catch (error) {
    res.json( {
      statusCode: 500,
      body: error
    })
  } 
}