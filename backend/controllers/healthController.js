const { getHealth } = require('../services/healthService');

const handleHealth = (_req, res) => {
  const payload = getHealth();
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
};

module.exports = { handleHealth };
