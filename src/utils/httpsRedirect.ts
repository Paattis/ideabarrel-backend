import { NextFunction, Request, Response } from 'express';

export const httpsRedirect = async (req: Request, res: Response, next: NextFunction) => {
  console.log("httpsRedirect", req.secure)
  if(process.env.APP_ENV != "DEVELOPEMENT" && !req.secure) {
    const newUrl = `https://${process.env.SERVER_IP}${req.url}`
    console.log("redirecting to", newUrl)

    return res.redirect(newUrl)
  }

  next();
}
