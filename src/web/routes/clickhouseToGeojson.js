const fetch = require('node-fetch');

module.exports = {
  fetchGeoJson: async (req, res) => {
    let chResult = await (await fetch(
      req.query.url
        ? req.query.url
        : `http://34.252.164.246:8123/?query=${req.query.query}%20FORMAT%20JSON`)).json();
    let result = {
      "type": "FeatureCollection",
      "features": chResult.data.map((value) => {
        let values = Object.values(value);

        return {
          "type": "Feature",
          "properties": {
            dbh: values[2 + (req.query.skipCol && Number(req.query.skipCol) || 0)],
          },
          "geometry": {
            "type": "Point",
            "coordinates": [
              values[0 + (req.query.skipCol && Number(req.query.skipCol) || 0)],
              values[1 + (req.query.skipCol && Number(req.query.skipCol) || 0)]
            ]
          }
        }
      }),
    };

    res.status(200).json(result);
  }
};
