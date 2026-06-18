import { TUserRole } from "../modules/user/user.interface.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: TUserRole;
        mobile: string;
      };
    }
  }
}

export {};
