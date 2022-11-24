import app from './app';
import { log } from './logger/log';

export const port = process.env.PORT || 3000;

app.listen(port, (): void => {
  log.info(`Backend listening to port ${port}`);
});
