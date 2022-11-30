const role = {"name": "Junior DevOps Engineer", "id": 1 }

const userInfo = {
  "name": "Victor Mike",
  "profile_img": "",
  "email": "victor.mike@app.com",
  "id": 10,
  "created_at": "2022-11-23T17:23:24.903Z",
  "role": role,
}

const tag = {"tag": {"name": "Cafeteria", "id": 15 } }

const like = {
    "idea_id": 1
}

const comment = {
  "content": "Nice idea",
  "id": 2,
  "updated_at": "2022-11-24T10:36:10.190Z",
  "idea": {
    "id": 1
  }
}

const newUser = {
  ...userInfo,
  "comments": [], "ideas": [], "likes": [] 
}

const ideaInfo = {
  "id": 1,
  "title": "Add coffee machine",
  "content": "We really should have access to free coffee.",
  "created_at": "2022-11-23T17:52:40.243Z",
  "user": {
    "id": 1,
    "name": "John Doe"
  },
}

const idea = {
    ...ideaInfo,
    "comments": [comment],
    "likes": [like],
    "tags": [tag]
}

const _user = {
  ...userInfo,
  "comments": [
    comment
  ], 
  "ideas": [
    idea
  ], 
  "likes": [
    like
  ] 
}






export const definitions = {
  newUser: newUser,
  user: _user,
  idea: idea,
  comment: comment,
  role: role
}