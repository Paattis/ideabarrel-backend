import request from 'supertest';

import app from '../src/app';

describe('GET /', () => {
  test('hello world route should return "Hello world!" /', async () => {

    const res = await request(app).get('/').expect(200)
    expect(res.body).toEqual({msg: 'Hello world!'})

  });
});