import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

/**
 * Backing database context.
 */
export let db: PrismaContext = {
  prisma: new PrismaClient(),
};

/**
 * Database context for actual application.
 */
export type PrismaContext = {
  prisma: PrismaClient;
};

/**
 * Database context for unit test mocks
 */
export type MockPrismaContext = {
  prisma: DeepMockProxy<PrismaClient>;
};

/**
 * Creates mockup of PrismaClient.
 * @returns  Mockup PrismaClient
 */
export const createMockContext = (): MockPrismaContext => {
  return {
    prisma: mockDeep<PrismaClient>(),
  };
};

/**
 * Switches singleton context to mockup version.
 * @param mock
 */
export const swapToMockContext = (mock: MockPrismaContext) => {
  db = mock;
};

/**
 * Switches singleton context to app version.
 */
export const swapToAppContext = () => {
  db = {
    prisma: new PrismaClient(),
  };
};
