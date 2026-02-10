// Express application definition
// Defines the app instance with GET route handlers for / and /evening endpoints
const express = require('express');

const app = express();

// GET / - Returns 'Hello world' as plain text
app.get('/', (req, res) => {
  res.type('text/plain');
  res.send('Hello world');
});

// GET /evening - Returns 'Good evening' as plain text
app.get('/evening', (req, res) => {
  res.type('text/plain');
  res.send('Good evening');
});

module.exports = app;
