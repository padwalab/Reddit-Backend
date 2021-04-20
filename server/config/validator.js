import validator from 'express-validator';
const { check, validationResult } = validator;

export const registerValidation = [
  check('firstName', "First name can't be blank").not().isEmpty(),
  check('lastName', "Last name can't be blank").not().isEmpty(),
  check('email', 'Enter a valid email').isEmail(),
  check('password', 'Password must be 6 or more characters long').isLength({
    min: 6,
  }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    next();
  },
];

export const loginValidation = [
  check('email', 'Enter a valid email').isEmail(),
  check('password', 'Password is required').exists(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    next();
  },
];

export const profileUpdateValidation = [
  check('newPassword', 'Password must be 6 or more characters long').isLength({
    min: 6,
  }),
  (req, res, next) => {
    if (req.body.newPassword) {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];

export const communityValidation = [
  check('communityName', 'Community Name is required').not().isEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    next();
  },
];
