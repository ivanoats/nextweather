import axios from 'axios';

export default async (req, res) => {
  const station = req.query.station || 'KSEA'
   try {
    const observations = await axios.get(`https://api.weather.gov/stations/${station}/observations`)
    res.json({
      statusCode: 200,
      body: JSON.parse(observations.data)
    })
  
  } catch (error) {
    res.json( {
      statusCode: 500,
      body: error
    })
  } 
}