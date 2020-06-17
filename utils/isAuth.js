import jwt from 'jsonwebtoken';
import users from '../data/users';

const isAuth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) next(new Error('Token is not found!'));
  const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const user = users.find((user) => user.id === payload.id);
  if (user) {
    req.user = user;
    return next();
  }
  const err = new Error();
  err.statusCode = 401;
  err.message = 'Unauthorized';
  next(err);
};

export default isAuth;
