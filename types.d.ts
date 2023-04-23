import { Role } from 'src/auth/role.enum';

declare module 'express-session' {
  interface SessionData {
    user: {
      userId: number;
      username: string;
      userEmail: string;
      roles: [Role];
    };
  }
}

declare module 'express' {
  interface Request {
    user: {
      userId: number;
      username: string;
      userEmail: string;
      roles: [Role];
    };
  }
}