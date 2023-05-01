import { Role } from "src/user/role/role.enum";


declare module 'express' {
    export interface Request {
        user: {
            userId: number;
            userName: string;
            userEmail: string;
            userRole: Role;
            userState: boolean;
        };
    }
}