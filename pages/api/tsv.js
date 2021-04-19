import axios from 'axios';

export default async (req, res) => {
  const station = req.query.station || 'WPOW1'
   try {
    // @ts-ignore
    const observations = await axios.get(`https://www.ndbc.noaa.gov/data/hourly2/hour_00.txt`)

    res.json({
      statusCode: 200,
      body: `"${observations.data}"`
    })
  
  } catch (error) {
    res.json( {
      statusCode: 500,
      body: error
    })
  } 
}