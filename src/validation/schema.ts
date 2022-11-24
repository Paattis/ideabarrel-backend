import { checkSchema, validationResult } from 'express-validator';
import { BadRequest } from '../utils/errors';
import { TRequest } from '../utils/types';
import { db } from '../db/context';
import {
  isString,
  notEmpty,
  isEmail,
  isPositive,
  capitalize,
  inRange,
  max,
  isArray,
} from './helpers';

export const throwIfNotValid = (req: TRequest<any>) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequest('Invalid request body', errors.array());
  }
};

export const validIdeaBody = checkSchema({
  title: {
    isString,
    notEmpty,
    isLength: max(100),
    trim: true,
  },
  content: {
    isString,
    notEmpty,
    isLength: max(1000),
    trim: true,
  },
  tags: {
    isArray,
    notEmpty,
  },
  'tags.*': {
    isInt: isPositive,
  },
});

export const validTagBody = checkSchema({
  name: {
    isString,
    notEmpty,
    isLength: max(255),
    trim: true,
  },
  description: {
    optional: true,
    isString,
    notEmpty,
    isLength: max(500),
    trim: true,
  },
});

export const validAuthBody = checkSchema({
  email: {
    isString,
    notEmpty,
    isEmail,
  },
  password: {
    isString,
    notEmpty,
  },
});

export const validLikeBody = checkSchema({
  idea_id: {
    isInt: isPositive,
    toInt: true,
  },
});

export const validRoleBody = checkSchema({
  name: {
    isString,
    notEmpty,
    trim: true,
    customSanitizer: capitalize,
  },
});

export const validUserBody = checkSchema({
  name: {
    isString,
    notEmpty,
    isLength: inRange(2, 255),
    matches: {
      options: /^[a-z ,.'-]+$/i,
      errorMessage: 'must not contain special characters',
    },
    trim: true,
    // escape: true,
  },
  role_id: {
    toInt: true,
    isInt: isPositive,
  },
  password: {
    isString,
    isLength: inRange(6, 64),
    matches: {
      options: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/,
      errorMessage: 'should have atleast one uppercase letter and one number',
    },
  },
  email: {
    isString,
    isEmail,
  },
});

export const validCommentBody = checkSchema({
  content: {
    trim: true,
    customSanitizer: capitalize,
    isString,
    notEmpty,
    isLength: max(500),
  },
  idea_id: {
    toInt: true,
    isInt: isPositive,
  },
});
