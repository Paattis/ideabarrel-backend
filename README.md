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
```properties
#App variables
APP_ENV=DEVELOPEMENT | PRODUCTION | CI
DATABASE_URL=(your database url)
PORT=(port)
ACCESS_TOKEN_SECRET=(JWT signing secret)

# Admin user created with seeding script (/src/db/seed.ts)
ADMIN_EMAIL=(your admin email)
ADMIN_PW=(your admin password)
```

* run the Prisma migrations to add the tables to your development database
```
$ npx prisma db migrate dev
$ npx prisma generate
```

* Run seed script

```bash
$ npx prisma db seed
```

* build/test and then run the backend in development mode
```
$ npm run build
$ npm run dev
```

<br>
<br>

# Users
## <span style="color: #6ec3d4">`GET`</span> - `/users`
### Response
`application/json`
```json
[
  {
    "comments": [],
    "name": "User",
    "profile_img": "",
    "email": "user@app.com",
    "id": 1,
    "role": {
      "name": "admin",
      "id": 1
    },
    "created_at": "2022-11-21T14:54:32.887Z",
    "ideas": []
  },
]
```

## <span style="color: #6ec3d4">`GET`</span> - `/users/:id`
### Response
`application/json`
```json
{
  "comments": [],
  "name": "User",
  "profile_img": "",
  "email": "user@app.com",
  "id": 1,
  "role": {
    "name": "admin",
    "id": 1
  },
  "created_at": "2022-11-21T14:54:32.887Z",
  "ideas": []
},
```




## <span style="color: #87d65a">`POST`</span> - `/users`
### Request
`multipart/form-data`
```
name:     User,
role_id:  2,
password: password,
email:    user@app.com,
avatar:   image file
```

### Response
`application/json`
```json
{
  "comments": [],
  "name": "User",
  "profile_img": "1669052777822-668015599.jpg",
  "email": "user@nokia.com",
  "id": 1,
  "role": {
    "name": "Senior Engineer",
    "id": 2
  },
  "created_at": "2022-11-21T17:46:18.001Z",
  "ideas": []
}
```


## <span style="color: #1589F0">`PUT`</span> - `/users/:id`
### Request
`application/json`
```json
  {
    "name": "New Name",
    "email": "new.email@app.com",
    "role_id": 8,
    "password": "newpassword"
  }
```

### Response
`application/json`
```json
{
  "comments": [],
  "name": "New Name",
  "profile_img": "1669050855379-231410051.jpg",
  "email": "new.email@app.com",
  "id": 2,
  "role": {
    "name": "New Role",
    "id":8
  },
  "created_at": "2022-11-21T15:02:10.929Z",
  "ideas": []
}
```






## <span style="color: #1589F0">`PUT`</span> - `/users/:id/img`
#### Adds image file as specified users avatar.
### Privileges
- same user as action target
- admin
### Request
`multipart/form-data`
```
avatar: image file
```

### Response
`application/json`
```json
{
  "comments": [],
  "name": "User",
  "profile_img": "1669050855379-231410051.jpg",
  "email": "user@nokia.com",
  "id": 1,
  "role": {
    "name": "Senior Engineer",
    "id": 2
  },
  "created_at": "2022-11-21T15:02:10.929Z",
  "ideas": []
}
```


## <span style="color: #e85141">`DELETE`</span> - `/users/:id/img`

#### Deletes profile avatar from specified user, and returns that user.

### Privileges
- same user as action target
- admin

### Response
`application/json`
```json
{
  "comments": [],
  "name": "User",
  "profile_img": "",
  "email": "niklas@nokia.com",
  "id": 2,
  "role": {
    "name": "Senior Engineer",
    "id": 2
  },
  "created_at": "2022-11-21T15:02:10.929Z",
  "ideas": []
}
```


# Authentication

## <span style="color: #87d65a">`POST`</span> - `/auth/login`

### Privileges
- all users

### Request
`application/json`
```json
{
  "email": "user@app.com",
  "password": "password"
}
```

### Response
`application/json`
```json
{
  "result": {
    "comments": [],
    "name": "User",
    "profile_img": "1669050855379-231410051.jpg",
    "email": "user@app.com",
    "id": 1,
    "role": {
      "name": "Senior Engineer",
      "id": 1
    },
    "created_at": "2022-11-21T15:02:10.929Z",
    "ideas": []
  },
  "token": "JWT_TOKEN_WITH_ID_AND_ROLE_ID"
}
```


# Roles

## <span style="color: #87d65a">`POST`</span> - `/roles`

### Required privileges
- admin

### Request
`application/json`
```json
{
  "name": "Senior Engineer"
}
```

### Response
`application/json`
```json
{
  "id": 1,
  "name": "Senior Engineer",
  "users": []
}
```


## <span style="color: #1589F0">`PUT`</span> - `/roles/:id`

### Required privileges
- admin

### Request
`application/json`
```json
{
  "name": "New name for role"
}
```

### Response
`application/json`
```json
{
  "id": 1,
  "name": "New name for role",
  "users": []
}
```

## <span style="color: #6ec3d4">`GET`</span> - `/roles`
### Required privileges
- authenticated user
- admin
### Request
`application/json`
```json
[
  {
    "id": 1,
    "name": "Senior Developer",
    "created_at": "2022-11-21T14:54:32.790Z",
  },
  {
    "id": 2,
    "name": "Senior Engineer",
    "created_at": "2022-11-21T14:59:22.391Z",
  }
]
```

### Response
`application/json`
```json
[
  {
    "id": 1,
    "name": "Senior Developer",
  },
  {
    "id": 2,
    "name": "Senior Engineer",
  },
]
```

## <span style="color: #6ec3d4">`GET`</span> - `/roles?usr=1`
### Required privileges
- authenticated user
- admin
### Response
`application/json`
```json
[
  {
    "id": 1,
    "name": "Senior Developer",
    "users": [
      {
        "name": "User 1",
        "id": 1
      }
    ]
  },
  {
    "id": 2,
    "name": "Senior Engineer",
    "users": [
      {
        "name": "User 2",
        "id": 3
      }
    ]
  },
]
```

## <span style="color: #6ec3d4">`GET`</span> - `/roles/:id`
### Required privileges
- authenticated user
- admin
### Response
`application/json`
```json
{
  "id": 1,
  "name": "Senior Developer",
}
```

## <span style="color: #6ec3d4">`GET`</span> - `/roles/:id?usr=1`
### Required privileges
- authenticated user
- admin
### Response
`application/json`
```json
{
  "id": 1,
  "name": "Senior Developer",
  "users": [
    {
      "name": "User 1",
      "id": 1
    }
  ]
}
```

## <span style="color: #e85141">`DELETE`</span> - `/roles/:id`
### Required privileges
- admin

### Response
`application/json`
```json
{
  "id": 1,
  "name": "Senior Developer",
},
```


# Ideas
## <span style="color: #6ec3d4">`GET`</span> - `/ideas`
### Response
`application/json`
```json
[
  {
    "id": 1,
    "title": "Add coffee machine",
    "content": "We really should have access to free coffee.",
    "created_at": "2022-11-23T17:52:40.243Z",
    "user": {
      "id": 1,
      "name": "admin"
    },
    "comments": [
      {
        "content": "Nice idea",
        "user": {
          "id": 1,
          "name": "admin"
        },
        "id": 2,
        "created_at": "2022-11-24T10:36:10.190Z"
      },
    ],
    "likes": [
      {
        "user_id": 1
      }
    ],
    "tags": [
      {
        "tag": {
          "name": "Cafeteria",
          "id": 15
        }
      },
    ]
  },
]
```

## <span style="color: #6ec3d4">`GET`</span> - `/ideas/:id`
### Response
`application/json`
```json
{
    "id": 1,
    "title": "Add coffee machine",
    "content": "We really should have access to free coffee.",
    "created_at": "2022-11-23T17:52:40.243Z",
    "user": {
      "id": 1,
      "name": "admin"
    },
    "comments": [
      {
        "content": "Nice idea",
        "user": {
          "id": 1,
          "name": "admin"
        },
        "id": 2,
        "created_at": "2022-11-24T10:36:10.190Z"
      },
    ],
    "likes": [
      {
        "user_id": 1
      }
    ],
    "tags": [
      {
        "tag": {
          "name": "Cafeteria",
          "id": 15
        }
      },
    ]
  }
```


## <span style="color: #87d65a">`POST`</span> - `/ideas`

### Privileges
- authenticated user

### Request
`application/json`
```json
{
  "title": "New idea",
  "content": "Some cool idea, must be implemented.",
  "tags": [ 1, 17 ]
}
```

### Response
`application/json`
```json
{
  "id": 5,
  "created_at": "2022-11-29T14:19:22.952Z",
  "comments": [],
  "user": {
    "id": 268,
    "name": "Victor Mike"
  },
  "content": "Some cool idea, must be implemented.",
  "likes": [],
  "title": "New idea",
  "tags": [
    {
      "tag": {
        "name": "admin",
        "id": 1
      }
    },
    {
      "tag": {
        "name": "RnD",
        "id": 17
      }
    }
  ]
}
```

## <span style="color: #1589F0">`PUT`</span> - `/ideas/:id`

### Privileges
- authenticated owner
- admin

### Request
`application/json`
```json
{
  "title": "New idea (Updated)",
  "content": "Some cool idea, must be implemented. (Or not)",
  "tags": [ 1, 17, 28 ]
}
```

### Response
`application/json`
```json
{
  "id": 5,
  "user": {
    "id": 268,
    "name": "Victor Mike"
  },
  "title": "New idea (Updated)",
  "content": "Some cool idea, must be implemented. (Or not)",
  "created_at": "2022-11-29T14:19:22.952Z",
  "comments": [
    {
      "content": "Not gonna happen",
      "user": {
        "id": 1,
        "name": "admin"
      },
      "id": 2,
      "created_at": "2022-11-24T10:36:10.190Z"
    },
  ],
  "likes": [
    {
      "user_id": 1
    }
  ],
  "tags": [
    {
      "tag": {
        "name": "Cafeteria",
        "id": 1
      }
    },
    {
      "tag": {
        "name": "Management",
        "id": 17
      }
    },
    {
      "tag": {
        "name": "RnD",
        "id": 28
      }
    }
  ]
}
```


## <span style="color: #e85141">`DELETE`</span> - `/ideas/:id`

### Privileges
- authenticated owner
- admin


### Response
`application/json`
```json
{
  "id": 5,
  "user": {
    "id": 268,
    "name": "Victor Mike"
  },
  "title": "New idea (Updated)",
  "content": "Some cool idea, must be implemented. (Or not)",
  "created_at": "2022-11-29T14:19:22.952Z",
  "comments": [
    {
      "content": "Not gonna happen",
      "user": {
        "id": 1,
        "name": "admin"
      },
      "id": 2,
      "created_at": "2022-11-24T10:36:10.190Z"
    },
  ],
  "likes": [
    {
      "user_id": 1
    }
  ],
  "tags": [
    {
      "tag": {
        "name": "Cafeteria",
        "id": 1
      }
    },
    {
      "tag": {
        "name": "Management",
        "id": 17
      }
    },
    {
      "tag": {
        "name": "RnD",
        "id": 28
      }
    }
  ]
}
```