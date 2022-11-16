import { Idea , User, Group, Role, Comment } from '@prisma/client';
import {IdeaWithGroups} from '../../src/db/ideas';
import request from 'supertest';
import app from '../../src/app';
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

beforeEach(() => {
  mockCtx = createMockContext();
  ctx = mockCtx as unknown as PrismaContext;
});

afterAll(() => {
  swapToAppContext();
});

const timestamp = new Date();


const group: Group = {
  id : 1,
  description : "Test group",
  created_at : timestamp,
  updated_at : timestamp,
  name : "Test group"
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
const user1: User = {
  id: 1,
  name: 'Test User 1',
  role_id: 1,
  created_at: timestamp,
  updated_at: timestamp,
};
const user2: User = {
  id: 2,
  name: 'Test User 2',
  role_id: 1,
  created_at: timestamp,
  updated_at: timestamp,
};

const idea: IdeaWithGroups = {
  id: 1,
  content: 'Lorem ipsum dolor sit amet',
  user_id: 1,
  created_at: timestamp,
  updated_at: timestamp,
  groups: [group],
}






/**
 * Tests for POST method on route /ideas
 */
describe('POST /ideas/', () => {
  test('Route should create and return idea with status 200', async () => {
    swapToMockContext(mockCtx);
    //mockCtx.prisma.group.findFirstOrThrow.mockResolvedValue(group);
    mockCtx.prisma.idea.create.mockResolvedValue(idea);

    console.log(JSON.stringify(idea))

    const res = await request(app).post('/ideas/').send({
      content: "Lorem ipsum dolor sit amet",
      user: 1,
      groups: [1,]
    });

    expect(res.statusCode).toBe(200);
    console.log("res body",res.body)
    expect(res.body).toMatchObject({
      id: 1,
      content: 'Lorem ipsum dolor sit amet',
      user_id: 1, // TODO: remove when the auth endpoints are finished
      groups: [
        expectedGroup
      ]
    });

  });

  test('Route should fail to create idea if a non-existent group is given', async () => {
    swapToMockContext(mockCtx);
    //mockCtx.prisma.role.findFirstOrThrow.mockRejectedValue(new Error('Mock Error'));
    mockCtx.prisma.group.create.mockResolvedValue(group);

    const res = await request(app).post('/ideas/').send({
      content: "This will fail",
      user: 1,
      "groups[]": [444,]
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
 * Tests for DELETE method on route /ideas
 */
describe('DELETE /ideas/:id', () => {
  test('Route should delete and return idea with status 200', async () => {
    swapToMockContext(mockCtx);
    mockCtx.prisma.idea.delete.mockResolvedValue(idea);

    const res = await request(app).delete('/ideas/1');

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      id: 1,
      content: 'Lorem ipsum dolor sit amet'
    });
  });

  test('Route should fail to delete non-existent idea and return error with status 404', async () => {
    swapToMockContext(mockCtx);
    mockCtx.prisma.idea.delete.mockRejectedValue(idea);
    const res = await request(app).delete('/ideas/11')
    console.log("res body", res.body)
    expect(res.statusCode).toBe(404)
    expect(res.body).toMatchObject({
        status: 404,
        msg: 'No such idea exists' 
    })
  });

})

