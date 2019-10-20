const { logger: log } = require('../../util');
const expressWinston = require('express-winston');
const modelInitializer = require('./modelInitializer');
const bodyParser = require('body-parser');
const errorHandler = require('./error.js');
const notFoundHandler = require('./404.js');
const cors = require('cors');

module.exports = {
  beforeHandler: [
    app => app.options('*', cors()),
    app => app.use('*', (req, res, next) => {
      //replace localhost to the address of your server
      res.header("Access-Control-Allow-Origin", "https://bananasa.s3.eu-west-1.amazonaws.com");
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      res.header('Access-Control-Allow-Credentials', true);
      next();
    }),
    app => app.use(expressWinston.logger(log)),
    app => app.use(bodyParser.json({ limit: '10mb' })),
    modelInitializer],
  notFound: notFoundHandler,
  errorSink: errorHandler,
};
