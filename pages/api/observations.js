import axios from 'axios';

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