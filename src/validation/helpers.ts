import { Meta } from 'express-validator';
import { db } from '../db/Database';

export const capitalize = {
  options: (value: string, _: any) => {
    if (value.length) {
      return value.charAt(0).toUpperCase() + value.slice(1);
    } else {
      return value;
    }
  },
};

export const toIntArray = {
  options: (value: string, _: any) => {
    return value
      ?.trim()
      ?.split(',')
      ?.map((n) => parseInt(n, 10));
  },
};

export const sort = {
  desc: {
    options: (value: string, { req }: Meta) => {
      const fields = ['likes', 'comments', 'date'];
      if (!fields.find((f) => f === value)) {
        throw new Error('desc');
      }
      return value;
    },
    errorMessage: `should ne of [${['likes', 'comments', 'date'].join(',')}]`,
  },
  asc: {
    options: (value: string, { req }: Meta) => {
      const fields = ['likes', 'comments', 'date'];
      if (!fields.find((f) => f === value)) {
        throw new Error('asc');
      }
      return value;
    },
    errorMessage: `should ne of [${['likes', 'comments', 'date'].join(',')}]`,
  },
};

export const isString = {
  errorMessage: 'must be of string type',
};
export const notEmpty = {
  errorMessage: 'must not be empty',
};
export const isEmail = {
  errorMessage: 'is not valid email address',
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
      isInt: isPositive,
    },
  },
};
export const email = {
  notInUse: {
    options: async (value: string) => {
      const exists = await db().users.emailExists(value);
      if (exists) {
        throw new Error('email');
      }
    },
    errorMessage: 'is already taken',
  },
  isSameOrUnique: {
    options: async (value: string, { req }: Meta) => {
      const id = parseInt(req.params?.id, 10);
      const ok = await db().users.emailIsSameOrUnique(value, id);
      if (!ok) {
        throw new Error('email');
      }
    },
    errorMessage: 'is already taken',
  },
};

export const role = {
  exists: {
    options: async (value: number) => {
      const exists = await db().roles.exists(value);
      if (!exists) {
        throw new Error('role_id');
      }
    },
    errorMessage: 'doesnt exist',
  },
};

export const isStrong = {
  options: {
    minLength: 8,
    minNumbers: 1,
    minUppercase: 1,
    minLowercase: 0,
    minSymbols: 0,
  },
  errorMessage:
    'Should be atleast 8 chars of length, and have atleast one uppercase letter and a number',
};

export const avatar = {
  exists: {
    custom: {
      options: (_: any, { req }: Meta) => !!req.file,
      errorMessage: 'is missing from request',
    },
  },
};

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
