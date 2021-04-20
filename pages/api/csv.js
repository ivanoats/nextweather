import axios from 'axios';
import parse from 'csv-parse/lib/sync';
import { metersPerSecondToMph} from './convert';
/**
 * @param {{ query: { station: string; tideStation: string }; }} req
 * @oaran res
 */
export default async function handler(req, res) {
  let errors = []
  let observations = {}

  const weatherStation = req.query.station || 'WPOW1'
  const uri = 'https://sdf.ndbc.noaa.gov/sos/server.php'

  const tideStationId= req.query.tideStation || '9447130'
  const tideUri = `https://tidesandcurrents.noaa.gov/api/datagetter?station=${tideStationId}&product=water_level&datum=mllw&time_zone=lst_ldt&units=english&format=json&date=latest&application=westpointwinddotcom`

  try {
    const {data} = await axios.get(uri, {
      params: {
        request: "GetObservation",
        service: "SOS",
        version: "1.0.0",
        offering: `urn:ioos:station:wmo:${weatherStation}`,
        observedproperty: "winds",
        responseformat: "text/csv",
        // responseformat: "application/ioos+xml;version=0.6.1",
        // responseformat: "application/vnd.google-earth.kml+xml",
        eventtime: "latest"
      }
    })
    const records = parse(data, {
      columns: true
    })
    const weatherData = records[0]

    observations.stationId = weatherData.station_id
    observations.windSpeed = metersPerSecondToMph(parseInt(weatherData['wind_speed (m/s)']))
    observations.windDirection = parseInt(weatherData['wind_from_direction (degree)'])
    observations.windGust = metersPerSecondToMph(parseInt(weatherData['wind_speed_of_gust (m/s)']))

  } catch (error) {
    errors.push(error)
  }
  try {
    // get temp
    const tempResults = await axios.get(uri, {
      params: {
        request: 'GetObservation',
        service: 'SOS',
        version: '1.0.0',
        offering: `urn:ioos:station:wmo:${weatherStation}`,
        observedProperty: 'air_temperature',
        responseformat: 'text/csv',
        eventtime: 'latest'
      }
    })
    const tempData = parse(tempResults.data, {
      columns: true
    })[0]
    observations.airTemp = parseInt(tempData['air_temperature (C)'])
  } catch (error) {
    errors.push(error)
  }

  try {
    // get current tide level
    const tideResults = await axios.get(tideUri)
    const tide = tideResults.data
    const currentTide = tide.data[tide.data.length - 1]
    observations.currentTide = currentTide.v
  } catch (error) {
    errors.push(error)
  }

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  if (errors.length < 1) {
    res.status(200).json(observations)
  } else {
    console.log(errors)
    res.status(500).json(errors)
  }
}