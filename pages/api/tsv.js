const got = require('got');

export default async (req, res) => {
  const station = req.query.station || 'WPOW1'
   try {
    // @ts-ignore
    const observations = await got(`https://www.ndbc.noaa.gov/data/hourly2/hour_00.txt`)

    res.json({
      statusCode: 200,
      body: `"${observations.body}"`
    })
  
  } catch (error) {
    res.json( {
      statusCode: 500,
      body: error
    })
  } 
}