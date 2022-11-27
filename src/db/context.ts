import { PrismaClient } from '@prisma/client';
import { DeepMockProxy } from 'jest-mock-extended';

/**
 * Backing database context.
 */
export let db: AppPrismaContext = {
  prisma: new PrismaClient(),
};

/**
 * Database context for actual application.
 */
export type AppPrismaContext = {
  prisma: PrismaClient;
};

/**
 * Database context for unit test mocks
 */
export type MockPrismaContext = {
  prisma: DeepMockProxy<PrismaClient>;
};

/**
 * Database context type for encapsulating bot mock and app
 * contextes.
 */
export type PrismaContext = AppPrismaContext | MockPrismaContext;
