const got = require('got');

export default async (req, res) => {
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

    res.json({
      statusCode: 200,
      body: `"${body}"`
    })
  
  } catch (error) {
    res.json( {
      statusCode: 500,
      body: error
    })
  } 
}