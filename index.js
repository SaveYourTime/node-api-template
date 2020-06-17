import express from 'express';
import expressAsyncErrors from 'express-async-errors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import isAuth from './utils/isAuth';

dotenv.config();
const { PORT, HOST, ORIGIN } = process.env;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(helmet());
app.use(compression());
app.use(cors({ origin: process.env.ORIGIN }));

const accessLogStream = fs.createWriteStream(path.join(path.resolve(), 'access.log'), {
  flags: 'a',
});
app.use(morgan('combined', { stream: accessLogStream }));

app.use(express.static('public'));

app.use('/auth', authRoutes);
app.use('/admin', isAuth, adminRoutes);

app.get('/', (req, res, next) => {
  res.sendFile(path.join(path.resolve(), 'views', 'index.html'));
});

app.use((req, res, next) => {
  const statusCode = 404;
  const message = 'Page Not Found!';
  res.status(404).json({ statusCode, message });
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = 'Internal server error' } = err;
  res.status(statusCode).json({ statusCode, message });
});

app.listen(PORT, HOST, () => {
  console.log(`Application is running on: http://${HOST}:${PORT}`);
  console.log(`Accepting requests from origin: "${ORIGIN}"`);
});
