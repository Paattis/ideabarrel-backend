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
