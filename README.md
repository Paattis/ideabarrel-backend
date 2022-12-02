# IdeaBarrel

### Backend for the App for the course TX00CK67-3010

Bootstrapped based on [these](https://medium.com/swlh/build-a-rest-api-with-express-js-and-typescript-dc2c8da89c52) [instructions](https://medium.com/@sudarshanadayananda/how-to-live-reload-typescript-node-server-bc40171fdb7).


## Development

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

## Updating in production
`$ make update_prod`

## API Endpoints

<details>
<summary><h3>Users</h3></summary>

### <span style="color: #6ec3d4">`GET`</span> - `/users`
***Summary***

Get all of the user profiles.

***Required Privileges***

- Authenticated users
- Admin

 ***Response***
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
---

### <span style="color: #6ec3d4">`GET`</span> - `/users/:id`
***Summary***

Get user profile with specified id.

***Required Privileges***

- Authenticated users
- Admin

 ***Response***
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

---


### <span style="color: #87d65a">`POST`</span> - `/users`
***Summary***

Create new user profile.

***Required Privileges***

- all

***Request***
`multipart/form-data`
```
name:     Victor Mike,
role_id:  2,
password: PassWord123,
email:    victor.mike@app.com,
avatar:   image file
```

 ***Response***
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
---

### <span style="color: #1589F0">`PUT`</span> - `/users/:id`
***Summary***

Update user profile

***Required Privileges***
- Authenticated users, who are also the target of the update
- Admins

***Request***
`application/json`
```json
  {
    "name": "Micktor Vike",
    "email": "micktor.vike@app.com",
    "role_id": 8,
    "password": "NewPassword123"
  }
```

 ***Response***
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

---

### <span style="color: #1589F0">`PUT`</span> - `/users/:id/img`
***Summary***

Adds image file as specified users avatar.

***Required Privileges***

- same user as action target
- admin

***Request***
`multipart/form-data`
```
avatar: image file
```

 ***Response***
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

---

### <span style="color: #e85141">`DELETE`</span> - `/users/:id/img`
***Summary***

Deletes profile avatar from specified user, and returns that user.

***Required Privileges***

- same user as action target
- admin

 ***Response***
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
</details>

<details>
<summary><h3>Authentication</h3></summary>

### <span style="color: #87d65a">`POST`</span> - `/auth/login`
***Summary***

Authenticate user with email and password.

***Required Privileges***

- none

***Request***
`application/json`
```json
{
  "email": "victor.mike@app.com",
  "password": "Password123"
}
```

 ***Response***
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



### <span style="color: #87d65a">`POST`</span> - `/auth/login/token`
***Summary***

Authenticate user with JWT (Bearer)

***Required Privileges***

- Authenticated users
- Admin

 ***Response***
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

</details>

<details>
<summary><h3>Roles</h3></summary>

### <span style="color: #87d65a">`POST`</span> - `/roles`
***Summary***

Create new role.

***Required privileges***
- admin

***Request***
`application/json`
```json
{
  "name": "Senior Engineer"
}
```

 ***Response***
`application/json`
```json
{
  "id": 1,
  "name": "Senior Engineer",
  "users": []
}
```
---

### <span style="color: #1589F0">`PUT`</span> - `/roles/:id`
***Summary***

Update role with specifed id.


***Required privileges***
- admin

***Request***
`application/json`
```json
{
  "name": "New name for role"
}
```

 ***Response***
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

---

### <span style="color: #6ec3d4">`GET`</span> - `/roles`
***Summary***

Get all of the roles.

***Required privileges***

- authenticated user
- admin

 ***Response***
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
---

### <span style="color: #6ec3d4">`GET`</span> - `/roles?usr=1`
***Summary***

Get all of the roles, with subscribed users attached to them.

***Required privileges***

- authenticated user
- admin

***Response***
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

---

### <span style="color: #6ec3d4">`GET`</span> - `/roles/:id`
### Required privileges
- authenticated user
- admin
 ***Response***
`application/json`
```json
{
  "id": 1,
  "name": "Senior Developer",
}
```

---

### <span style="color: #6ec3d4">`GET`</span> - `/roles/:id?usr=1`
***Summary***

Get role with specified id, with all users subscribed to it.

***Required privileges***

- authenticated user
- admin

 ***Response***
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

---

### <span style="color: #e85141">`DELETE`</span> - `/roles/:id`
***Required privileges***
- admin

 ***Response***
`application/json`
```json
{
  "id": 1,
  "name": "Senior Developer",
},
```
</details>

<details>
<summary><h3>Ideas</h3></summary>

### <span style="color: #6ec3d4">`GET`</span> - `/ideas`
***Summary***

Get all of the existing ideas.

 ***Response***
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

---

### <span style="color: #6ec3d4">`GET`</span> - `/ideas/:id`
***Summary***

Get idea with specified id.

***Required privileges***

- authenticated user

 ***Response***
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

---

### <span style="color: #87d65a">`POST`</span> - `/ideas`
***Summary***

Create new idea.
***Required Privileges***

- authenticated user
- admin

***Request***
`application/json`
```json
{
  "title": "New idea",
  "content": "Some cool idea, must be implemented.",
  "tags": [ 1, 17 ]
}
```

 ***Response***
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

---

### <span style="color: #1589F0">`PUT`</span> - `/ideas/:id`
***Summary***

Update idea with specified id.

***Required Privileges***

- authenticated owner
- admin

***Request***
`application/json`
```json
{
  "title": "New idea (Updated)",
  "content": "Some cool idea, must be implemented. (Or not)",
  "tags": [ 1 ]
}
```

 ***Response***
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
---

### <span style="color: #e85141">`DELETE`</span> - `/ideas/:id`
***Summary***

Remove idea with specified id.

***Required Privileges***

- authenticated owner
- admin


 ***Response***
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

</details>

<details>
<summary><h3>Tags</h3></summary>

### <span style="color: #6ec3d4">`GET`</span> - `/tags`
***Summary***

Get all of the existing tags.

***Required Privileges***

- authenticated user

 ***Response***
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
***Summary***

Get all of the existing tags, and include users who have subscribed to them.

***Required Privileges***

- authenticated user

***Response***
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
---

### <span style="color: #6ec3d4">`GET`</span> - `/tags/:id`
***Summary***

Get tag with specified id.

***Required Privileges***

- authenticated user

 ***Response***
`application/json`
```json
{
  "id": 1,
  "name": "Food",
  "description": "Ideas related to food.",
},
```
---

### <span style="color: #6ec3d4">`GET`</span> - `/tags/:id?usr=1`
***Summary***

Get tag with specified id. Include users that have subscribed to it.
***Required Privileges***

- authenticated user

 ***Response***
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
---

### <span style="color: #87d65a">`POST`</span> - `/tags`
***Summary***

Create new tag. Description field is optional.

***Required Privileges***
- admin

***Request***
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

 ***Response***
`application/json`
```json
{
  "id": 1,
  "name": "Snacks",
  "description": "Ideas related to snacks served in office"
}
```
---

### <span style="color: #87d65a">`POST`</span> - `/tags/:tagId/user/:userId`
***Summary***
User subscribes to specified tag.

***Required Privileges***

- authenticated user (same as target)
- admin

 ***Response***
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

---

### <span style="color: #1589F0">`PUT`</span> - `/tags/:tagId`
***Summary***

Update tag with specified id.

***Required Privileges***

- admin

***Request***
`application/json`
```json
{
  "name": "Snacks V2",
  "description": "Ideas related to snacks served in office",
}
```
 ***Response***
`application/json`
```json
{
  "id": 2,
  "name": "Snacks V2",
  "description": "Ideas related to snacks served in office"
}
```

---

### <span style="color: #e85141">`DELETE`</span> - `/tags/:tagId/user/:userId`
***Summary***

User unsubscribes from specified tag.

***Required Privileges***

- authenticated user (same as target)
- admin

 ***Response***
`application/json`
```json
{
  "id": 1,
  "name": "Snacks",
  "description": "Ideas related to snacks served in office",
  "users": []
}
```
---

### <span style="color: #e85141">`DELETE`</span> - `/tags/:id`
***Summary***

Delete specified tag.

***Required Privileges***

- admin

 ***Response***
`application/json`
```json
{
  "id": 1,
  "name": "Snacks",
  "description": "Ideas related to snacks served in office"
}
```

</details>


<details>
<summary><h3>Comments</h3></summary>


### <span style="color: #87d65a">`POST`</span> - `/users`
***Summary***

Create new comment on idea.

***Required Privileges***

- Authenticated user.
- admin

***Request***
`application/json`
```json
{
  "content": "Cool idea :)",
  "idea_id": 1
}
```
 ***Response***
`application/json`
```json
  {
  "content": "Cool idea :)",
  "user": {
    "id": 10,
    "name": "Victor Mike"
  },
  "id": 2,
  "idea": {
    "id": 1,
    "user_id": 1
  },
  "created_at": "2022-11-24T10:36:10.190Z"
}
```
---

### <span style="color: #e85141">`DELETE`</span> - `/comments/:id`
***Summary***

Delete specified Comment.

***Required Privileges***

- Authenticated user who owns the comment
- admin

 ***Response***
`application/json`
```json
  {
  "content": "Comment on some idea",
  "user": {
    "id": 10,
    "name": "Victor Mike"
  },
  "id": 2,
  "idea": {
    "id": 1,
    "user_id": 1
  },
  "created_at": "2022-11-24T10:36:10.190Z"
}
```
---

### <span style="color: #1589F0">`PUT`</span> - `/comments/:id`
***Summary***

Update specified Comment.

***Required Privileges***

- Authenticated user who owns the comment
- admin

***Request***
`application/json`
```json
{
  "content": "Updated comment content",
}
```
 ***Response***
`application/json`
```json
  {
  "content": "Updated comment content",
  "user": {
    "id": 10,
    "name": "Victor Mike"
  },
  "id": 2,
  "idea": {
    "id": 1,
    "user_id": 1
  },
  "created_at": "2022-11-24T10:36:10.190Z"
}
```
---

### <span style="color: #6ec3d4">`GET`</span> - `/comments`
Get all of the comments.

***Required Privileges***

- Authenticated user
- admin

 ***Response***
`application/json`
```json
[
  {
    "content": "Nice idea",
    "user": {
      "id": 10,
      "name": "Victor Mike"
    },
    "id": 2,
    "idea": {
      "id": 1,
      "user_id": 1
    },
    "created_at": "2022-11-24T10:36:10.190Z"
  },
]
```
---

### <span style="color: #6ec3d4">`GET`</span> - `/comments/:id`
***Summary***

Get comment with specified id.

***Required Privileges***

- Authenticated user
- admin

 ***Response***
`application/json`
```json
{
  "content": "Nice idea",
  "user": {
    "id": 10,
    "name": "Victor Mike"
  },
  "id": 2,
  "idea": {
    "id": 1,
    "user_id": 1
  },
  "created_at": "2022-11-24T10:36:10.190Z"
},
```

</details>



<details>
<summary><h3>Likes</h3></summary>

### <span style="color: #87d65a">`POST`</span> - `/likes/idea/:ideaId`
***Summary***

User likes specified idea.

***Required***

- Authenticated user
- admin

 ***Response***
`application/json`
```json
{
  "user": {
    "id": 1,
    "name": "admin"
  },
  "id": 30,
  "idea": {
    "id": 1,
    "user_id": 1
  },
  "created_at": "2022-11-30T19:01:28.126Z"
}
```

---

### <span style="color: #e85141">`DELETE`</span> - `/likes/idea/:ideaId`
***Summary***

User removes his/hers like on specified idea.

***Required Privileges***

- Authenticated user
- admin

 ***Response***
`application/json`
```json
{
  "user": {
    "id": 10,
    "name": "Victor Mike"
  },
  "id": 30,
  "idea": {
    "id": 1,
    "user_id": 1
  },
  "created_at": "2022-11-30T19:01:28.126Z"
}
```

---

### <span style="color: #6ec3d4">`GET`</span> - `/likes`
***Summary***

Get all of the likes.

***Required Privileges***

- admin

 ***Response***
`application/json`
```json
[
  {
    "user": {
      "id": 10,
      "name": "Victor Mike"
    },
    "id": 30,
    "idea": {
      "id": 1,
      "user_id": 1
    },
    "created_at": "2022-11-30T19:01:28.126Z"
  }
]
```
---

### <span style="color: #6ec3d4">`GET`</span> - `/likes/:likeId`
***Summary***

Get like with specified id

***Required Privileges***
- admin

 ***Response***
`application/json`
```json
{
  "user": {
    "id": 10,
    "name": "Victor Mike"
  },
  "id": 30,
  "idea": {
    "id": 1,
    "user_id": 1
  },
  "created_at": "2022-11-30T19:01:28.126Z"
}
```

---

### <span style="color: #6ec3d4">`GET`</span> - `/likes/idea/{ideaId}`
***Summary***

Get all of the likes associated with specified idea.
Also includes count of the ideas.

***Required Privileges***
- Authenticated users
- Admin

 ***Response***
`application/json`
```json
{
  "count": 2
  "likes": [
    {
      "id": 1,
      "user": {
        "id": 10,
        "name": "Victor Mike"
      }
    },
    {
      "id": 2,
      "user": {
        "id": 20,
        "name": "Bob Mike"
      }
    }
  ],
}
```

---

### <span style="color: #e85141">`DELETE`</span> - `/likes/:likeId`
***Summary***

Admin can remove any like.

***Required Privileges***

- admin

 ***Response***
`application/json`
```json
{
  "user": {
    "id": 10,
    "name": "Victor Mike"
  },
  "id": 30,
  "idea": {
    "id": 1,
    "user_id": 1
  },
  "created_at": "2022-11-30T19:01:28.126Z"
}
```
---

</details>
