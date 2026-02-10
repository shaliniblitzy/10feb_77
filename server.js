// Server entry point
// Imports the Express app and starts the HTTP server on port 3000
const app = require('./app');

const PORT = 3000;

// Start the Express server and bind to the configured port
const server = app.listen(PORT, () => {
  console.log('Server running on port 3000');
});

module.exports = server;
