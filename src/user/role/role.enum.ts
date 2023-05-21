import { RolesBuilder } from 'nest-access-control';

export enum Role {
    User = 'User',
    Mod = 'Mod',
    Admin = 'Admin'
}

export const roles: RolesBuilder = new RolesBuilder();

roles.grant(Role.User)
        .readOwn('profile')
        .updateOwn('profile')
        .deleteOwn('profile')
        .readAny('product')
        .createAny('product')
        .updateAny('product')
        .readAny('store')
        .createAny('store')
        .updateOwn('store')
        .createAny('suggestion')
    .grant(Role.Mod)
        .extend(Role.User)
        .deleteAny('product')
        .readAny('suggestion')
        .deleteAny('suggestion')
        .updateAny('user-state')
    .grant(Role.Admin)
        .extend(Role.Mod)
        .readAny('user')
        .updateAny('user')
        .deleteAny('user')
        .deleteAny('store');
