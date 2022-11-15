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

# API Routes

<details>
  <summary><h2>/user</h2></summary>
  
### GET
#### Response
```json
{
  "id": 1,
  "name": "User 1"
  "role_id": 1
  "created_at" : "2022-11-13T17:08:54.565Z"
  "updated_at" : "2022-11-13T17:08:54.565Z"
}
  
```
### POST
#### Body
```json
{
  "name": "User 1"
  "role_id": 1
}
```

#### Response
```json
{
  "id": 1,
  "name": "User 1"
  "role_id": 1
  "created_at" : "2022-11-13T17:08:54.565Z"
  "updated_at" : "2022-11-13T17:08:54.565Z"
}
```

</details>

<details>
  <summary><h2>/user/:id<h2></summary>
  
### PUT
#### Body
```json
{
  "name": "User 1"
  "role_id": 1
}
```
#### Response
```json
{
  "id": 1,
  "name": "User 1"
  "role_id": 1
  "created_at" : "2022-11-13T17:08:54.565Z"
  "updated_at" : "2022-11-13T17:08:54.565Z"
}
```

### DELETE
#### Response
```json
{
  "id": 1,
  "name": "User 1"
  "role_id": 1
  "created_at" : "2022-11-13T17:08:54.565Z"
  "updated_at" : "2022-11-13T17:08:54.565Z"
}
```

</details>
    
    
<details>
  <summary><h2>/roles<h2></summary>
  
### GET
#### Response
```json
[
  {
    "id": 46,
    "name": "Junior Manager",
    "created_at": "2022-11-13T15:59:35.818Z",
    "updated_at": "2022-11-13T15:59:35.818Z"
  },
  {
    "id": 47,
    "name": "Senior Engineer",
    "created_at": "2022-11-13T16:02:57.265Z",
    "updated_at": "2022-11-13T16:02:57.265Z"
  }
]
```
### POST

#### Request
```json
{
  "name": "Junior Manager",
}
```

#### Response
```json
{
  "id": 46,
  "name": "Junior Manager",
  "created_at": "2022-11-13T15:59:35.818Z",
  "updated_at": "2022-11-13T15:59:35.818Z"
}
```

</details>
    
    
    
    
    
    
    
<details>
  <summary><h2>/roles/:id<h2></summary>
  
### GET
#### Response
```json
{
  "id": 46,
  "name": "Junior Manager",
  "created_at": "2022-11-13T15:59:35.818Z",
  "updated_at": "2022-11-13T15:59:35.818Z"
}
```
### PUT

#### Request
```json
{
  "name": "Junior Manager",
}
```

#### Response
```json
{
  "id": 46,
  "name": "Junior Manager",
  "created_at": "2022-11-13T15:59:35.818Z",
  "updated_at": "2022-11-13T15:59:35.818Z"
}
```
    
### GET
#### Response
```json
{
  "id": 46,
  "name": "Junior Manager",
  "created_at": "2022-11-13T15:59:35.818Z",
  "updated_at": "2022-11-13T15:59:35.818Z"
}
```
### DELETE

#### Response
```json
{
  "name": "Junior Manager",
}
```

</details>
