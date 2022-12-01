import { checkSchema, validationResult } from 'express-validator';
import { BadRequest } from '../utils/errors';
import { TRequest } from '../utils/types';
import {
  isString,
  notEmpty,
  isEmail,
  isPositive,
  capitalize,
  inRange,
  max,
  isArray,
  email,
  avatar,
  isStrong,
  role,
} from './helpers';

export const throwIfNotValid = (req: TRequest<any>) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequest('Invalid request body', errors.array());
  }
};

export const validIdeaBody = checkSchema({
  title: {
    exists: true,
    isString,
    notEmpty,
    isLength: max(40),
    trim: true,
  },
  content: {
    exists: true,
    isString,
    notEmpty,
    isLength: max(1000),
    trim: true,
  },
  tags: {
    exists: true,
    isArray,
    notEmpty,
  },
  'tags.*': {
    isInt: isPositive,
  },
});

export const validTagBody = checkSchema({
  name: {
    exists: true,
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

export const validEmailCheck = checkSchema({
  email: {
    exists: true,
    isString,
    notEmpty,
    isEmail,
  },
});

export const validAuthBody = checkSchema({
  email: {
    exists: true,
    isString,
    notEmpty,
    isEmail,
  },
  password: {
    exists: true,
    isString,
    notEmpty,
  },
});

export const validLikeBody = checkSchema({
  idea_id: {
    exists: true,
    isInt: isPositive,
    toInt: true,
  },
});

export const validRoleBody = checkSchema({
  name: {
    exists: true,
    isString,
    notEmpty,
    trim: true,
    customSanitizer: capitalize,
  },
});

export const validUserBody = checkSchema({
  name: {
    exists: true,
    isString,
    notEmpty,
    isLength: inRange(3, 20),
    matches: {
      options: /^[a-zA-ZäöüÄÖÜß ,.'-]+$/i,
      errorMessage: 'must not contain special characters',
    },
    trim: true,
  },
  role_id: {
    exists: true,
    toInt: true,
    isInt: isPositive,
    custom: role.exists,
  },
  password: {
    exists: true,
    isString,
    isStrongPassword: isStrong,
  },
  email: {
    exists: true,
    isString,
    isEmail,
    custom: email.notInUse,
  },
});

export const validAvatar = checkSchema({
  avatar: avatar.exists,
});

export const validCommentBody = checkSchema({
  content: {
    trim: true,
    customSanitizer: capitalize,
    exists: true,
    isString,
    notEmpty,
    isLength: max(500),
  },
  idea_id: {
    exists: true,
    toInt: true,
    isInt: isPositive,
  },
});
