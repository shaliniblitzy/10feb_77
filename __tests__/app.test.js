/**
 * Comprehensive Jest test suite for the Express application.
 * Validates both GET route handlers and error handling behavior using Supertest
 * for HTTP assertions without starting a live server.
 */
const request = require('supertest');
const app = require('../app');

describe('Express App', () => {
  test('GET / should return Hello world with status 200', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toBe('Hello world');
  });

  test('GET / should return text/plain content type', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
  });

  test('GET /evening should return Good evening with status 200', async () => {
    const res = await request(app).get('/evening');
    expect(res.status).toBe(200);
    expect(res.text).toBe('Good evening');
  });

  test('GET /evening should return text/plain content type', async () => {
    const res = await request(app).get('/evening');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
  });

  test('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/nonexistent');
    expect(res.status).toBe(404);
  });

  test('POST / should return 404', async () => {
    const res = await request(app).post('/');
    expect(res.status).toBe(404);
  });

  test('POST /evening should return 404', async () => {
    const res = await request(app).post('/evening');
    expect(res.status).toBe(404);
  });
});
