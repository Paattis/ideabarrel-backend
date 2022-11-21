import { Idea , User, Group, Role, Comment } from '@prisma/client';
import {IdeaWithGroups} from '../../src/db/ideas';
import request from 'supertest';
import app from '../../src/app';
import auth from '../../src/utils/auth';
import {
  MockPrismaContext,
  PrismaContext,
  createMockContext,
  swapToMockContext,
  swapToAppContext,
} from '../../src/db/context';

jest.setTimeout(15000);

let mockCtx: MockPrismaContext;
let ctx: PrismaContext;


afterAll(() => {
  swapToAppContext();
});

const timestamp = new Date();


const user1: User = {
  id: 1,
  name: 'Test User 1',
  profile_img: '',
  password: 'p455w0rd',
  role_id: 1,
  created_at: timestamp,
  updated_at: timestamp,
};
const user2: User = {
  id: 2,
  name: 'Test User 2',
  profile_img: '',
  password: '',
  role_id: 1,
  created_at: timestamp,
  updated_at: timestamp,
};

// JWT for test user
const JWT = auth.jwt({id: user1.id});
const mockJWT = () => {
  mockCtx.prisma.user.findFirstOrThrow.mockResolvedValueOnce(user1)
}

// top level jest stuff
beforeEach(() => {
  mockCtx = createMockContext();
  swapToMockContext(mockCtx);
  mockJWT()
  ctx = mockCtx as unknown as PrismaContext;
});


const group: Group = {
  id : 1,
  description : "Test group",
  created_at : timestamp,
  updated_at : timestamp,
  name : "Test group"
}

const group2: Group = {
  id : 2,
  description : "Test group2",
  created_at : timestamp,
  updated_at : timestamp,
  name : "Test group2"
}

// required because the endpoint returns groups with dates as strings
const expectedGroup = {
  ...group,
  created_at : timestamp.toISOString(),
  updated_at : timestamp.toISOString(),
}


const role: Role = {
  id: 1,
  created_at: timestamp,
  updated_at: timestamp,
  name: 'Test Engineer',
};


const idea: IdeaWithGroups = {
  id: 1,
  content: 'Lorem ipsum dolor sit amet',
  user_id: 1,
  created_at: timestamp,
  updated_at: timestamp,
  groups: [group],
}

const idea2: IdeaWithGroups = {
  id: 1,
  content: 'New content',
  user_id: 1,
  created_at: timestamp,
  updated_at: timestamp,
  groups: [group2],
}


/**
 * Tests for POST method on route /ideas
 */
describe('POST /ideas/', () => {
  test('Route should give out a 401 if no user is logged in', async () => {
    const res = await request(app).post('/ideas/').send({
      content: "Lorem ipsum dolor sit amet",
      //user: 1,
      groups: [1,] 
    });

    expect(res.statusCode).toBe(401);
  }),

  test('Route should create and return idea with status 200', async () => {

    mockCtx.prisma.user.findFirstOrThrow.mockResolvedValueOnce(user1)
    mockCtx.prisma.idea.create.mockResolvedValue(idea);
    mockCtx.prisma.group.findMany.mockRejectedValue([group]);

    console.log(JSON.stringify(idea))

    const res = await request(app).post('/ideas/').auth(JWT, {type: 'bearer'}).send({
      content: "Lorem ipsum dolor sit amet",
      //user: 1,
      groups: [1,]
    });

    expect(res.statusCode).toBe(200);
    console.log("res body",res.body)
    expect(res.body).toMatchObject({
      id: 1,
      content: 'Lorem ipsum dolor sit amet',
      //user_id: 1, // TODO: remove when the auth endpoints are finished
      groups: [
        expectedGroup
      ]
    });

  });

  test('Route should fail to create idea if a non-existent group is given', async () => {
    swapToMockContext(mockCtx);
    mockCtx.prisma.idea.create.mockRejectedValue(idea);
    mockCtx.prisma.user.findFirstOrThrow.mockResolvedValueOnce(user1)
    mockCtx.prisma.group.create.mockResolvedValue(group);

    const res = await request(app).post('/ideas/').auth(JWT, {type: 'bearer'}).send({
      content: "This will fail",
      //user: 1,
      groups: [444,]
    });
    console.log("Res code", res.statusCode)
    console.log("Res body", res.body)
    expect(res.body).toMatchObject({ 
        status: 400, 
        msg: 'No group exists with that id, cant create idea.' 
      })
    expect(res.statusCode).toBe(400);

  });
});

/**
* Tests for PUT method on route /ideas/<idea_id>
*/
describe('PUT /ideas/:idea_id', () => {
  test('Route should give out a 401 if no user is logged in', async () => {
    const res = await request(app).put('/ideas/1').send({
      content: "New content",
      "groups": [2]
    })

    expect(res.statusCode).toBe(401);
  }),

  test('Route should update and return idea with status 200 and new data', async () => {
    swapToMockContext(mockCtx);
    mockCtx.prisma.idea.update.mockResolvedValue(idea2);
    mockCtx.prisma.idea.findFirstOrThrow.mockResolvedValue(idea2);
    mockCtx.prisma.group.findMany.mockResolvedValue([group2]);

    const res = await request(app).put('/ideas/1').auth(JWT, {type: 'bearer'}).send({
      content: "New content",
      "groups": [2]
    })

    console.log("res body put test: ", res.body)
    expect(res.body).toMatchObject({
      content: "New content",
      groups: [
        {
          ...group2,
          created_at : timestamp.toISOString(),
          updated_at : timestamp.toISOString(),
        }
      ]
    })
  });

  test('Route should fail with status 400 and not update the idea if one or more of the given groups doesn\'t exist', async () => {
    swapToMockContext(mockCtx);
    mockCtx.prisma.idea.update.mockResolvedValue(idea);
    mockCtx.prisma.idea.findFirstOrThrow.mockResolvedValue(idea);
    mockCtx.prisma.group.update.mockResolvedValue(group2);


    const res = await request(app).put('/ideas/1').auth(JWT, {type: 'bearer'}).send({
      content: "New content",
      "groups": [33, 2]
    })

    console.log("res body put test 400: ", res.body)
    expect(res.statusCode).toBe(400)
    //expect(res.body).toMatchObject()
  })
})

/**
 * Tests for DELETE method on route /ideas
 */
describe('DELETE /ideas/:idea_id', () => {
  test('Route should give out a 401 if no user is logged in', async () => {
    const res = await request(app).delete('/ideas/1')

    expect(res.statusCode).toBe(401);
  }),


  test('Route should delete and return idea with status 200', async () => {
    swapToMockContext(mockCtx);
    mockCtx.prisma.idea.findFirstOrThrow.mockResolvedValue(idea);
    mockCtx.prisma.idea.delete.mockResolvedValue(idea);

    const res = await request(app).delete('/ideas/1').auth(JWT, {type: 'bearer'});

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      id: 1,
      content: 'Lorem ipsum dolor sit amet'
    });
  });

  test('Route should fail to delete non-existent idea and return error with status 404', async () => {
    swapToMockContext(mockCtx);
    mockCtx.prisma.idea.delete.mockRejectedValue(idea);
    const res = await request(app).delete('/ideas/11').auth(JWT, {type: 'bearer'})
    console.log("res body", res.body)
    expect(res.statusCode).toBe(404)
    expect(res.body).toMatchObject({
        status: 404,
        msg: 'No such idea exists' 
    })
  });

})

