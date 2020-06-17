import validator from 'express-validator';

const { validationResult } = validator;

const validate = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((validation) => validation.run(req)));

  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  res.status(422).json({ statusCode: 401, message: errors.errors[0].msg, errors: errors.array() });
};

export default validate;
