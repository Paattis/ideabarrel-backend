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
  toIntArray,
  sort,
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
    isLength: max(40),
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

export const validEmailCheck = checkSchema({
  email: {
    isString,
    notEmpty,
    isEmail,
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
    isLength: inRange(3, 20),
    matches: {
      options: /^[a-zA-ZäöüÄÖÜß ,.'-]+$/i,
      errorMessage: 'must not contain special characters',
    },
    trim: true,
  },
  role_id: {
    toInt: true,
    isInt: isPositive,
    custom: role.exists,
  },
  password: {
    isString,
    isStrongPassword: isStrong,
  },
  email: {
    isString,
    isEmail,
    custom: email.isSameOrUnique,
  },
});

export const validIdeaQuery = checkSchema({
  tags: {
    in: 'query',
    optional: true,
    matches: {
      options: /^[0-9]+(,[0-9]+)*$/,
      errorMessage: 'should be tag ids (int), separated by comma.',
    },
    customSanitizer: toIntArray,
  },
  page_num: {
    in: 'query',
    optional: true,
    isNumeric: { errorMessage: 'page number must be integer' },
    toInt: true,
  },
  asc: {
    in: 'query',
    optional: true,
    isString: true,
    custom: sort.asc,
  },
  desc: {
    in: 'query',
    optional: true,
    isString: true,
    custom: sort.desc,
  },
});

export const validUserUpdateBody = checkSchema({
  name: {
    optional: true,
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
    optional: true,
    toInt: true,
    isInt: isPositive,
    custom: role.exists,
  },
  password: {
    optional: true,
    isString,
    isStrongPassword: isStrong,
  },
  email: {
    optional: true,
    isString,
    isEmail,
    custom: email.isSameOrUnique,
  },
});

export const validAvatar = checkSchema({
  resId: {
    in: 'params',
    isInt: isPositive,
  },
  avatar: avatar.exists,
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
