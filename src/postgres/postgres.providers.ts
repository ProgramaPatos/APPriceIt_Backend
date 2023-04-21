import { ConfigService } from "@nestjs/config";

// Use this to debug queries if needed
// const initOptions = {
//     query(e) {
//         console.log(e.query);
//     }
// };
const pgp = require('pg-promise')();


export const PostgresProvider = {
    provide: "POSTGRES_PROVIDER",
    useFactory: async (config: ConfigService) => {
        return pgp(config.get("DB_CONNECTION_STRING"));
    },
    inject: [ConfigService]
}
