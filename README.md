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
    "name": "Victor Mike",
    "profile_img": "",
    "email": "victor.mike@app.com",
    "id": 10,
    "created_at": "2022-11-23T17:23:24.903Z",
    "role": {
      "name": "Junior DevOps Engineer",
      "id": 1
    },
    "comments": [
      {
        "content": "Nice idea",
        "id": 2,
        "updated_at": "2022-11-24T10:36:10.190Z",
        "idea": {
          "id": 1
        }
      },
    ],
    "ideas": [
      {
        "id": 5,
        "created_at": "2022-11-29T14:19:22.952Z",
        "title": "New idea",
        "content": "Some cool idea, must be implemented."
      }
    ],
    "likes": [
      {
        "idea_id": 1
      }
    ]
  },
]
```

## <span style="color: #6ec3d4">`GET`</span> - `/users/:id`
### Response
`application/json`
```json
{
  "name": "Victor Mike",
  "profile_img": "",
  "email": "victor.mike@app.com",
  "id": 10,
  "created_at": "2022-11-23T17:23:24.903Z",
  "role": {
    "name": "Junior DevOps Engineer",
    "id": 1
  },
  "comments": [
    {
      "content": "Nice idea",
      "id": 2,
      "updated_at": "2022-11-24T10:36:10.190Z",
      "idea": {
        "id": 1
      }
    },
  ],
  "ideas": [
    {
      "id": 5,
      "created_at": "2022-11-29T14:19:22.952Z",
      "title": "New idea",
      "content": "Some cool idea, must be implemented."
    }
  ],
  "likes": [
    {
      "idea_id": 1
    }
  ]
},
```




## <span style="color: #87d65a">`POST`</span> - `/users`
### Request
`multipart/form-data`
```
name:     Victor Mike,
role_id:  2,
password: PassWord123,
email:    victor.mike@app.com,
avatar:   image file
```

### Response
`application/json`
```json
{
  "name": "Victor Mike",
  "profile_img": "1669052777822-668015599.jpg",
  "email": "victor.mike@app.com",
  "id": 10,
  "created_at": "2022-11-21T17:46:18.001Z",
  "role": {
    "name": "Junior DevOps Engineer",
    "id": 1
  },
  "comments": [],
  "ideas": [],
  "likes": []
}
```


## <span style="color: #1589F0">`PUT`</span> - `/users/:id`
### Request
`application/json`
```json
  {
    "name": "Micktor Vike",
    "email": "micktor.vike@app.com",
    "role_id": 8,
    "password": "NewPassword123"
  }
```

### Response
`application/json`
```json
{
  "name": "Micktor Vike",
  "profile_img": "1669050855379-231410051.jpg",
  "email": "micktor.Vike@app.com",
  "id": 2,
  "created_at": "2022-11-21T15:02:10.929Z",
  "role": {
    "name": "Senior DevOps Engineer",
    "id":8
  },
  "ideas": [
    {
      "id": 5,
      "created_at": "2022-11-29T14:19:22.952Z",
      "title": "New idea",
      "content": "Some cool idea, must be implemented."
    }
  ],
  "comments": [
    {
      "content": "Nice idea",
      "id": 2,
      "updated_at": "2022-11-24T10:36:10.190Z",
      "idea": {
        "id": 1
      }
    },
  ],
  "likes": [
    {
      "idea_id": 1
    }
  ]
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
  "name": "Micktor Vike",
  "profile_img": "NEW-IMG.jpg",
  "email": "micktor.Vike@app.com",
  "id": 2,
  "created_at": "2022-11-21T15:02:10.929Z",
  "role": {
    "name": "Senior DevOps Engineer",
    "id":8
  },
  "ideas": [
    {
      "id": 5,
      "created_at": "2022-11-29T14:19:22.952Z",
      "title": "New idea",
      "content": "Some cool idea, must be implemented."
    }
  ],
  "comments": [
    {
      "content": "Nice idea",
      "id": 2,
      "updated_at": "2022-11-24T10:36:10.190Z",
      "idea": {
        "id": 1
      }
    },
  ],
  "likes": [
    {
      "idea_id": 1
    }
  ]
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
  "name": "Micktor Vike",
  "profile_img": "",
  "email": "micktor.Vike@app.com",
  "id": 2,
  "created_at": "2022-11-21T15:02:10.929Z",
  "role": {
    "name": "Senior DevOps Engineer",
    "id":8
  },
  "ideas": [
    {
      "id": 5,
      "created_at": "2022-11-29T14:19:22.952Z",
      "title": "New idea",
      "content": "Some cool idea, must be implemented."
    }
  ],
  "comments": [
    {
      "content": "Nice idea",
      "id": 2,
      "updated_at": "2022-11-24T10:36:10.190Z",
      "idea": {
        "id": 1
      }
    },
  ],
  "likes": [
    {
      "idea_id": 1
    }
  ]
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
  "email": "victor.mike@app.com",
  "password": "Password123"
}
```

### Response
`application/json`
```json
{
  "name": "Victor Mike",
  "profile_img": "",
  "email": "victor.mike@app.com",
  "id": 10,
  "created_at": "2022-11-23T17:23:24.903Z",
  "role": {
    "name": "Junior DevOps Engineer",
    "id": 1
  },
  "comments": [
    {
      "content": "Nice idea",
      "id": 2,
      "updated_at": "2022-11-24T10:36:10.190Z",
      "idea": {
        "id": 1
      }
    },
  ],
  "ideas": [
    {
      "id": 5,
      "created_at": "2022-11-29T14:19:22.952Z",
      "title": "New idea",
      "content": "Some cool idea, must be implemented."
    }
  ],
  "likes": [
    {
      "idea_id": 1
    }
  ],
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
  "users": [
    {
      "name": "Victor Mike",
      "id": 10
    },
  ]
}
```

## <span style="color: #6ec3d4">`GET`</span> - `/roles`
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
### Summary
Get all of the existing ideas.
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
      "name": "John Doe"
    },
    "comments": [
      {
        "content": "Nice idea",
        "user": {
          "id": 10,
          "name": "Victor Mike"
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
### Summary
Get idea with specified id.
### Required privileges
- authenticated user
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
      "name": "John Doe"
    },
    "comments": [
      {
        "content": "Nice idea",
        "user": {
          "id": 10,
          "name": "Victor Mike"
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
### Summary
Create new idea.
### Required Privileges
- authenticated user
- admin

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
    "id": 10,
    "name": "Victor Mike"
  },
  "content": "Some cool idea, must be implemented.",
  "likes": [
    {
      "idea_id": 1
    }
  ],
  "title": "New idea",
  "tags": [
    {
      "tag": {
        "name": "Management",
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
### Summary
Update idea with specified id.
### Required Privileges
- authenticated owner
- admin

### Request
`application/json`
```json
{
  "title": "New idea (Updated)",
  "content": "Some cool idea, must be implemented. (Or not)",
  "tags": [ 1 ]
}
```

### Response
`application/json`
```json
{
  "id": 5,
  "user": {
    "id": 10,
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
        "name": "John Doe"
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
  ]
}
```


## <span style="color: #e85141">`DELETE`</span> - `/ideas/:id`
### Summary
Remove idea with specified id.

### Required Privileges
- authenticated owner
- admin


### Response
`application/json`
```json
{
  "id": 5,
  "user": {
    "id": 10,
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
        "name": "John Doe"
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
  ]
}
```


# Tags


## <span style="color: #6ec3d4">`GET`</span> - `/tags`
### Summary
Get all of the existing tags.
### Required Privileges
- authenticated user
### Response
`application/json`
```json
[
  {
    "id": 1,
    "name": "Food",
    "description": "Ideas related to food.",
  },
  {
    "id": 2,
    "name": "Management",
    "description": "Ideas related to management.",
  },
]
```


## <span style="color: #6ec3d4">`GET`</span> - `/tags?usr=1`
### Summary
Get all of the existing tags, and include users who have subscribed to them.
### Required Privileges
- authenticated user
### Response
`application/json`
```json
[
  {
    "id": 1,
    "name": "Food",
    "description": "Ideas related to food.",
    "users": [
      {
        "name": "Victor Mike",
        "id": 10
      }
    ]
  },
  {
    "id": 2,
    "name": "Management",
    "description": "Ideas related to management.",
    "users": [
      {
        "name": "John Doe",
        "id": 2
      },
      {
        "name": "Victor Mike",
        "id": 10
      }
    ]
  },
]
```

## <span style="color: #6ec3d4">`GET`</span> - `/tags/:id`
### Summary
Get tag with specified id.
### Required Privileges
- authenticated user
### Response
`application/json`
```json
{
  "id": 1,
  "name": "Food",
  "description": "Ideas related to food.",
},
```


## <span style="color: #6ec3d4">`GET`</span> - `/tags/:id?usr=1`
### Summary
Get tag with specified id. Include users that have subscribed to it.
### Required Privileges
- authenticated user
### Response
`application/json`
```json
{
  "id": 1,
  "name": "Food",
  "description": "Ideas related to food.",
  "users": [
    {
      "name": "Victor Mike",
      "id": 10
    }
  ]
},
```


## <span style="color: #87d65a">`POST`</span> - `/tags`
### Summary
Create new tag. Description field is optional.
### Required Privileges
- admin
### Request
`application/json`
```json
{
  "name": "Snacks",
  "description": "Ideas related to snacks served in office"
}
```
```json
{
  "name": "Snacks",
}
```

### Response
`application/json`
```json
{
  "id": 1,
  "name": "Snacks",
  "description": "Ideas related to snacks served in office"
}
```

## <span style="color: #87d65a">`POST`</span> - `/tags/:tagId/user/:userId`
### Summary
User subscribes to specified tag.
### Required Privileges
- authenticated user (same as target)
- admin
### Response
`application/json`
```json
{
  "id": 1,
  "name": "Snacks",
  "description": "Ideas related to snacks served in office",
  "users": [
    {
      "user": {
        "name": "Victor Mike",
        "id": 10
      }
    }
  ]
}
```


## <span style="color: #1589F0">`PUT`</span> - `/tags/:tagId`
### Summary
Update tag with specified id.
### Required Privileges
- admin

### Request
`application/json`
```json
{
  "name": "Snacks V2",
  "description": "Ideas related to snacks served in office",
}
```
### Response
`application/json`
```json
{
  "id": 2,
  "name": "Snacks V2",
  "description": "Ideas related to snacks served in office"
}
```


## <span style="color: #e85141">`DELETE`</span> - `/tags/:tagId/user/:userId`
### Summary
User unsubscribes from specified tag.

### Required Privileges
- authenticated user (same as target)
- admin

### Response
`application/json`
```json
{
  "id": 1,
  "name": "Snacks",
  "description": "Ideas related to snacks served in office",
  "users": []
}
```


## <span style="color: #e85141">`DELETE`</span> - `/tags/:id`
### Summary
Delete specified tag.
### Required Privileges
- admin
### Response
`application/json`
```json
{
  "id": 1,
  "name": "Snacks",
  "description": "Ideas related to snacks served in office"
}
```