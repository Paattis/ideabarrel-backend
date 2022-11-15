import bcrypt from 'bcryptjs';

const SALT = 10;

const hash = async (password: string) => {
  return await bcrypt.hash(password, SALT).then((it) => it);
};

const match = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

export default { hash, match };
