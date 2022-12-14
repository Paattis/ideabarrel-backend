import { NextFunction, Request, Response } from 'express';

export const httpsRedirect = async (req: Request, res: Response, next: NextFunction) => {
  if (
    process.env.APP_ENV !== undefined &&
    process.env.APP_ENV === 'PRODUCTION' &&
    !req.secure
  ) {
    const newUrl = `https://${process.env.SERVER_IP}${req.url}`;
    return res.redirect(newUrl);
  }

  next();
};
