const role = { name: 'Junior DevOps Engineer', id: 1 };

const userInfo = {
  name: 'Victor Mike',
  profile_img: '',
  email: 'victor.mike@app.com',
  id: 10,
  created_at: '2022-11-23T17:23:24.903Z',
  role,
};

const userShort = {
  id: userInfo.id,
  name: userInfo.name,
};

const ideaShort = {
  id: 1,
  user_id: 1,
};

const tag = { tag: { name: 'Cafeteria', id: 15, description: 'Ideas related to food' } };

const likeShort = {
  idea_id: 1,
};

const likeFull = {
  user: userShort,
  id: 30,
  idea: ideaShort,
  created_at: '2022-11-30T19:01:28.126Z',
};

const comment = {
  content: 'Nice idea',
  id: 2,
  updated_at: '2022-11-24T10:36:10.190Z',
  idea: {
    id: 1,
  },
  user: userShort,
};

const newUser = {
  ...userInfo,
  profile_img: '1669052777822-668015599.jpg',
  comments: [],
  ideas: [],
  likes: [],
};

const ideaInfo = {
  id: 1,
  title: 'Add coffee machine',
  content: 'We really should have access to free coffee.',
  created_at: '2022-11-23T17:52:40.243Z',
  user: userShort,
};

const ideaNoUser = {
  id: ideaInfo.id,
  title: ideaInfo.title,
  description: 'Ideas related to snacks',
  users: [],
};

const ideaWithUser = {
  ...ideaNoUser,
  users: [userShort],
};

const idea = {
  ...ideaInfo,
  comments: [comment],
  likes: [likeShort],
  tags: [tag],
};

const user = {
  ...userInfo,
  comments: [comment],
  ideas: [idea],
  likes: [likeShort],
};

const userWithToken = {
  ...user,
  token: 'JWT_TOKEN_WITH_ID_AND_ROLE_ID',
};

const emailFree = { free: Boolean };

export const definitions = {
  newUser,
  user,
  userWithToken,
  idea,
  ideaWithUser,
  comment,
  role,
  likeFull,
  emailFree,
};
