import { Inject, Injectable} from '@nestjs/common';
import { IDatabase } from 'pg-promise';
import { IClient } from 'pg-promise/typescript/pg-subset';
import UserQueryDTO from 'src/users/dtos/user-query.dto';
import * as argon from 'argon2';

@Injectable()
export class AuthService {
    constructor(
        @Inject('POSTGRES_PROVIDER')
        private pgdb: IDatabase<{}, IClient>,
    ) {}

    async validateUser(userEmail: string, password: string) {
        const user = (await this.pgdb.func('fun.get_user', [
          userEmail,
        ]));
        console.log(userEmail);
        if (!user || user.password==password) return null;

        // if (user.password == ) const pwValid = await argon.verify(user.password, password);
        // if (!pwValid) return null;

        return user;
    }

}
