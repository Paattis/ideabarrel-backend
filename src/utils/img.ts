import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { unlink as rm } from 'fs/promises';
import { log } from '../logger/log';

const folder = './uploads/';

const remove = async (imgPath: string) => {
  const toBeDeleted = path.join(folder, imgPath);
  log.debug(`Trying to deleting image: ${toBeDeleted}`);
  await rm(toBeDeleted);
  log.info(`Deleted image: ${toBeDeleted}`);
};

const fname = (file: Express.Multer.File) =>
  `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;

const storage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, filter) {
    filter(null, './uploads/');
  },
  filename: function (req, file, filter) {
    filter(null, fname(file));
  },
});

const f = (req: Request, file: Express.Multer.File, filter: FileFilterCallback) => {
  const mimeTypes = ['image/jpg', 'image/png', 'image/jpeg', 'image/gif'];
  if (!mimeTypes.includes(file.mimetype)) {
    return filter(null, false);
  }
  return filter(null, true);
};

const upload = multer({
  dest: './uploads/',
  fileFilter: f,
  storage: storage,
});
export default { upload, remove };
