const { routeRequest } = require('./routes');

const app = (req, res) => {
  routeRequest(req, res);
};

module.exports = app;
