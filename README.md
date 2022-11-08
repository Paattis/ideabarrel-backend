# IdeaBarrel

### Backend for the App for the course TX00CK67-3010

Bootstrapped based on [these](https://medium.com/swlh/build-a-rest-api-with-express-js-and-typescript-dc2c8da89c52) [instructions](https://medium.com/@sudarshanadayananda/how-to-live-reload-typescript-node-server-bc40171fdb7).

### Development

To run the backend in development mode

* install the necessary packages
```
$ npm install
```
* create a local MySQL or MariaDB development database
* populate the .env file
```
APP_ENV=DEVELOPEMENT
DATABASE_URL=(your database url)
```

* run the Prisma migrations to add the tables to your development database
```
$ npx prisma db push
```
* build/test and then run the backend in development mode
```
$ npm run build
$ npm run dev
```

