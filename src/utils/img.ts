import { NextFunction, Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { unlink } from 'fs/promises';
import { log } from '../logger/log';
import sharp, { JpegOptions } from 'sharp';
import fs from 'fs/promises';

const UPLOADS_FOLDER = './uploads/';
const AVATAR_W = 250;
const AVATAR_H = 320;

const remove = async (imgPath: string) => {
  try {
    if (!imgPath) {
      log.error('Can not delete image with no path');
      return;
    }
    const toBeDeleted = path.join(UPLOADS_FOLDER, imgPath);
    log.debug(`Trying to deleting image: ${toBeDeleted}`);
    await unlink(toBeDeleted);
    log.info(`Deleted image: ${toBeDeleted}`);
  } catch (error: any) {
    log.error(error.message);
  }
};

const jpeg: JpegOptions = {
  mozjpeg: true,
  quality: 80,
};

const resize = async (req: Request, _: Response, next: NextFunction) => {
  if (req.file) {
    log.debug(`About to resize file: ${req.file}`);
  } else {
    log.warn('No File associated with request. Skipping file resize');
    return next();
  }

  try {
    const inPath = path.join(UPLOADS_FOLDER, req.file.filename);
    log.debug(`in-path: ${inPath}`);

    const bytes = await fs.readFile(inPath);
    log.debug('Read file to byte buffer.');
    const result = await sharp(bytes)
      .resize(AVATAR_W, AVATAR_H)
      .jpeg(jpeg)
      .toFile(inPath);

    log.info(`Done. File saved as ${result.format} (${result.width}x${result.height})`);
  } catch (error) {
    log.error(error);
  } finally {
    next();
  }
};

const randomFilename = (file: Express.Multer.File) => {
  const random = Math.round(Math.random() * 1e9);
  const time = Date.now();
  const ext = path.extname(file.originalname);
  return `${time}-${random}${ext}`;
};

const storage = multer.diskStorage({
  destination(req: Request, file: Express.Multer.File, filter) {
    filter(null, UPLOADS_FOLDER);
  },
  filename(req, file, filter) {
    filter(null, randomFilename(file));
  },
});

const fileFilter = (
  _: Request,
  file: Express.Multer.File,
  filter: FileFilterCallback
) => {
  const mimeTypes = ['image/jpg', 'image/png', 'image/jpeg'];
  if (!mimeTypes.includes(file.mimetype)) {
    log.error(`incorrect mimetype: ${file.mimetype}`);
    return filter(null, false);
  }
  return filter(null, true);
};

const upload = multer({
  dest: UPLOADS_FOLDER,
  fileFilter,
  storage,
});
export default { upload, remove, resize };
