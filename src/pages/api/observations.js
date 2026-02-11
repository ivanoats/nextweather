import axios from 'axios';

/**
 * @typedef {import('next').NextApiRequest} NextApiRequest
 * @typedef {import('next').NextApiResponse} NextApiResponse
 */

/**
 * @typedef {object} ObservationResponse
 * @property {number} statusCode
 * @property {any} body
 */

/**
 * @param {NextApiRequest} req
 * @param {NextApiResponse} res
 */
const observations = async (req, res) => {
  const station = req.query.station || 'KSEA'
   try {
    const obs = await axios.get(`https://api.weather.gov/stations/${station}/observations`)
    res.json({
      statusCode: 200,
      body: JSON.parse(obs.data)
    })
  
  } catch (error) {
    res.json( {
      statusCode: 500,
      body: error
    })
  } 
}
export default observations