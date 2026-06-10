import { RoleEnum, TokenTypeEnum } from "../Enums";

declare module "jsonwebtoken" {
  interface JwtPayload {
    id: string;
    email: string;
    role: RoleEnum;
    tokenType?: TokenTypeEnum;
  }
}
