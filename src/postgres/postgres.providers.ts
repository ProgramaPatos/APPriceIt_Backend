import { ConfigService } from '@nestjs/config';
import * as pgPromise from 'pg-promise';

// Use this to debug queries if needed
// const initOptions = {
//     query(e) {
//         console.log(e.query);
//     }
// };
// const pgp = require('pg-promise')();
const pgp = pgPromise();

export const PostgresProvider = {
  provide: 'POSTGRES_PROVIDER',
  useFactory: async (config: ConfigService) => {
    return pgp(config.get('DB_CONNECTION_STRING'));
  },
  inject: [ConfigService],
};
