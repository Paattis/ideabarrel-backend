import * as dotenv from 'dotenv';
import { asserThat } from './assert';

dotenv.config();

type DefinedVars = 'APP_ENV' | 'ACCESS_TOKEN_SECRET' | 'ADMIN_PW' | 'ADMIN_EMAIL';

export const getAppEnvVar = (envVar: DefinedVars) => {
  const result = process.env[envVar];
  asserThat(result !== undefined).elseFail('undefined env var:', envVar);
  return result as string;
};
