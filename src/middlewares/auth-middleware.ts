import { Request, Response, NextFunction } from 'express';

export const fakeAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization'];
  if (token !== 'Bearer faketoken123') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  (req as any).user = { id: 1, name: 'Test User' };
  next();
};
