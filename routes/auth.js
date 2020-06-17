import express from 'express';
import validator from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validate from '../utils/validate';
import users from '../data/users';

const router = express.Router();
const { body } = validator;

router.post(
  '/signup',
  validate([
    body('username')
      .isEmail()
      .normalizeEmail()
      .custom((value) => {
        if (users.find(({ username }) => username === value)) {
          throw new Error('Username already exists');
        }
        return true;
      }),
    body('password')
      .isLength({ min: 6 })
      .withMessage('password must be at least 6 chars long')
      .matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)
      .withMessage(
        'password must contain at least one Capital letter, at least one lower case letter and at least one number or special character',
      )
      .trim(),
  ]),
  async (req, res, next) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { id: Math.random(), username, password: hashedPassword };
    users.push(user);
    res.status(201).json({ ...user, password: undefined });
  },
);

router.post(
  '/signin',
  validate([
    body('username').isEmail().normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('password must be at least 6 chars long')
      .matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)
      .withMessage(
        'password must contain at least one Capital letter, at least one lower case letter and at least one number or special character',
      )
      .trim(),
  ]),
  async (req, res, next) => {
    const { username, password } = req.body;
    const user = users.find((e) => e.username === username) || {};
    const match = await bcrypt.compare(password, user.password || '');
    if (match) {
      const token = jwt.sign({ ...user, password: undefined }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });
      res.cookie('token', token, {
        maxAge: +process.env.JWT_EXPIRES_IN,
        httpOnly: true,
      });
      return res.status(200).json({ token });
    }
    const err = new Error();
    err.statusCode = 401;
    err.message = 'Unauthorized';
    return next(err);
  },
);

export default router;
