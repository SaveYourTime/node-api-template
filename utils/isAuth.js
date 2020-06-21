import jwt from 'jsonwebtoken';
import users from '../data/users';

const isAuth = (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    const err = new Error();
    err.statusCode = 401;
    err.message = 'Token is not found!';
    return next(err);
  }
  const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const user = users.find(({ id }) => id === payload.id);
  if (user) {
    req.user = user;
    return next();
  }
  const err = new Error();
  err.statusCode = 401;
  err.message = 'Unauthorized';
  return next(err);
};

export default isAuth;
