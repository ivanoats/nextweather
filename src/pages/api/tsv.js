import axios from 'axios';

const obs =  async (req, res) => {
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

export default obs