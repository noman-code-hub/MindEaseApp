const app = require('./app');
const { port } = require('./config/appConfig');
const http = require('http');

http.createServer(app).listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
