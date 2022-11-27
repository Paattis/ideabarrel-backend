import { Meta } from 'express-validator';
import { db } from '../db/context';
import usersClient from '../db/users';

export const capitalize = {
  options: (value: string, _: any) => {
    if (value.length) {
      return value.charAt(0).toUpperCase() + value.slice(1);
    } else {
      return value;
    }
  },
};

export const isString = {
  errorMessage: 'must be of string type',
};
export const notEmpty = {
  errorMessage: 'must not be empty',
};
export const isEmail = {
  errorMessage: 'is not email',
};
export const isPositive = {
  errorMessage: 'must be of positive int type',
  options: { min: 1 },
};

export const user = {
  id: {
    params: {
      in: 'params',
      exists: true,
      toInt: true,
      isInt: isPositive
    }
  }
}
export const email = {
  notInUse: {
    options: async (value: any) => {
      const existing = await usersClient.selectByEmailSecret(value, db);
      if (existing) {
        throw new Error('email');
      }
    },
    errorMessage: 'is already taken',
  },
};

  export const isStrong = {
    options: {
      minLength: 8,
      minNumbers: 1,
      minUppercase: 1,
      minLowercase: 1,
      minSymbols: 0,
    },
    errorMessage:
      'Should be atleast 8 chars of length, and have atleast one uppercase letter and a number',
  }

export const avatar = {
  exists: {
    custom: {
      options: (_:any, { req }:Meta) => !!req.file,
      errorMessage: 'is missing from request',
    },
  },
}

export const inRange = (minimum: number, maximum: number) => {
  return {
    options: {
      min: minimum,
      max: maximum,
    },
    errorMessage: `must be ${minimum}-${maximum} chars long`,
  };
};

export const max = (maximum: number) => {
  return {
    options: {
      max: maximum,
    },
    errorMessage: `cant be larger than ${maximum} characters`,
  };
};

export const isArray = {
  errorMessage: 'must be an array',
};
