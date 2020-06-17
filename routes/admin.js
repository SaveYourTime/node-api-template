import express from 'express';

const router = express.Router();

router.get('/', (req, res, next) => {
  res.status(200).json({ message: 'message from protected route' });
});

export default router;
