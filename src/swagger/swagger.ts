// this is run as an npm script so the paths are correct
const outputFile = './src/swagger/swagger.json';
const endpointsFiles = ['./src/app.ts'];
import swaggerAutogen from 'swagger-autogen';
import { definitions } from './swagger_definitions';

const doc = {
  info: {
    version: '1.0.0',
    title: 'My API',
    description:
      'Documentation automatically generated by the <b>swagger-autogen</b> module.',
  },
  host: '10.114.34.65',
  schemes: ['http', 'https'],
  definitions,
};

const options = {
  openapi: '3.0.0',
};

swaggerAutogen(options)(outputFile, endpointsFiles, doc);
