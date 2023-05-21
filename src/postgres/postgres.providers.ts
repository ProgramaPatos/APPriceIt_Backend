import { ConfigService } from '@nestjs/config';
import * as pgPromise from 'pg-promise';

const initOptions = {
  // Use this to debug queries if needed
  query(e) {
    console.log(e.query);
  },
  error(err, e) {
    if (e.cn) {
      // this is a connection-related error
      // cn = safe connection details passed into the library:
      //      if password is present, it is masked by #
      console.log(1, err);
    }

    if (e.query) {
      // query string is available
      console.log(2, err);
      if (e.params) {
        // query parameters are available
      }
    }

    if (e.ctx) {
      // occurred inside a task or transaction
      console.log(3, err);
    }
  }
};

const pgp = pgPromise(initOptions);

export const PostgresProvider = {
  provide: 'POSTGRES_PROVIDER',
  useFactory: async (config: ConfigService) => {
    return pgp(config.get('DB_CONNECTION_STRING'));
  },
  inject: [ConfigService],
};
