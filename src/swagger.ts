const outputFile = './src/swagger.json';
const endpointsFiles = ['./src/app.ts'];
import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    version: '1.0.0',
    title: 'My API',
    description:
      'Documentation automatically generated by the <b>swagger-autogen</b> module.',
  },
  host: 'HOST HERE',
  schemes: ['http', 'https'],
  definitions: {},
};
swaggerAutogen(outputFile, endpointsFiles, doc);
