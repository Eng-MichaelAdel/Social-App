import { JwtPayload } from "jsonwebtoken";
import { IPayloadData, IUser } from "../Interfaces";
import { HydratedDocument } from "mongoose";

declare module "express-serve-static-core" {
  interface Request {
    user: HydratedDocument<IUser>;
    decode: IPayloadData & JwtPayload;
  }
}
