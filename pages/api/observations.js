const got = require('got');

export default (req, res) => {
  const station = req.queryStringParameters.station || 'KSEA'
  res.statusCode = 200
   try {
    // @ts-ignore
    const observations = await got(`https://api.weather.gov/stations/${station}/observations`)
    res.json({
      statusCode: 200,
      body: observations.body
    })
  
  } catch (error) {
    res.json( {
      statusCode: 500,
      body: error
    })
  } 
}