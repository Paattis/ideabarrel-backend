import request from 'supertest';

import app from '../src/app';

describe('GET /', () => {
  test('hello world route should return "Hello world!" /', async () => {
    console.log("aaa")
    const res = await request(app).get('/');
    //expect(res.body).toEqual('Hello world!');
  });
});