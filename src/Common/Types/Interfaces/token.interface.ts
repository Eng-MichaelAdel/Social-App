import { JwtPayload, PrivateKey, PublicKey, Secret, SignOptions, VerifyOptions } from "jsonwebtoken";
import { RoleEnum, TokenTypeEnum } from "../Enums";
import { IUser } from "./user.interface";
import { HydratedDocument } from 'mongoose';

export interface IGenerateToken {
  payload: IPayloadData;
  secret: Secret | PrivateKey;
  options?: SignOptions;
}

export interface IVerifyToken {
  token: string;
  secret: Secret | PublicKey;
  options?: VerifyOptions & { complete?: false };
}

export interface IPayloadData {
  id: string;
  email: string;
  role: RoleEnum;
  tokenType?: TokenTypeEnum;
}

export interface ISigniture {
  accessSignature: string;
  refreshSignature: string;
}

export interface ICreateLoginCredentials {
  payload: IPayloadData;
  options: {
    access: SignOptions;
    refresh: SignOptions;
  };
  requiredToken?: TokenTypeEnum;
}

export interface IReturnLoginCredentials {
  accessToken: string | undefined;
  refreshToken: string | undefined;
}

export interface IDecodeTokenReturn {
  userData: HydratedDocument<IUser>;
  decodedData: JwtPayload;
}
