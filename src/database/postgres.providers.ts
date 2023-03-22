import { ConfigService } from "@nestjs/config";

const pgp = require('pg-promise')();

export const PostgresProvider = {
    provide: "POSTGRES_PROVIDER",
    useFactory:async (config: ConfigService) => {
        return pgp(config.get("DB_CONNECTION_STRING"));
    },
    inject: [ConfigService]
}