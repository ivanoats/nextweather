const got = require('got');

export default async (req, res) => {
  const station = req.query.station || 'KSEA'
   try {
    // @ts-ignore
    const observations = await got(`https://api.weather.gov/stations/${station}/observations`)
    res.json({
      statusCode: 200,
      body: JSON.parse(observations.body)
    })
  
  } catch (error) {
    res.json( {
      statusCode: 500,
      body: error
    })
  } 
}