import { envConfig } from "../../Config";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { RoleEnum, TokenTypeEnum } from "../Types/Enums";
import { BadRequestException, NotFoundException } from "../Utils";
import { UserRepository } from "../../DB/Repositories";
import {
  ICreateLoginCredentials,
  IDecodeTokenReturn,
  IGenerateToken,
  IPayloadData,
  IReturnLoginCredentials,
  ISigniture,
  IVerifyToken,
} from "../Types";
import RedisService from "./Redis.service";
import { RevokedTokenKeyService } from ".";

const JwtSecrets = envConfig.JWT;

class TokenService {
  constructor(
    private userRepository: UserRepository = new UserRepository(),
    private redisService: RedisService = new RedisService(),
  ) {}

  createLoginCredentials({ payload, options, requiredToken }: ICreateLoginCredentials): IReturnLoginCredentials {
    let accessToken: string | undefined;
    let refreshToken: string | undefined;

    const detectedSecret: string | ISigniture = this._detectSignitureByRoleAndTokenType(payload.role, requiredToken);
    switch (requiredToken) {
      case TokenTypeEnum.access:
        accessToken = this._generateToken({
          payload: { ...payload, tokenType: TokenTypeEnum.access },
          secret: detectedSecret as string,
          options: options.access,
        });
        break;

      case TokenTypeEnum.refresh:
        refreshToken = this._generateToken({
          payload: { ...payload, tokenType: TokenTypeEnum.refresh },
          secret: detectedSecret as string,
          options: options.refresh,
        });
        break;

      default:
        console.log({ access: (detectedSecret as ISigniture).accessSignature, refresh: (detectedSecret as ISigniture).refreshSignature });

        accessToken = this._generateToken({
          payload: { ...payload, tokenType: TokenTypeEnum.access },
          secret: (detectedSecret as ISigniture).accessSignature,
          options: options.access,
        });
        refreshToken = this._generateToken({
          payload: { ...payload, tokenType: TokenTypeEnum.refresh },
          secret: (detectedSecret as ISigniture).refreshSignature,
          options: options.refresh,
        });
        break;
    }
    return { accessToken, refreshToken };
  }

  async decodeToken(token: string): Promise<IDecodeTokenReturn> {
    //  decode token to get role
    const decodedData = jwt.decode(token) as JwtPayload;

    //  check id and role are sent through payload
    if (!decodedData?.id || !decodedData?.role) {
      throw new BadRequestException("invalid payload");
    }

    //  ! check if there is revoked token
    const revokedKey = RevokedTokenKeyService.RevokenKeyFormat({ id: decodedData?.id, Jti: decodedData?.jti as string });
    if (await this.redisService.get(revokedKey)) {
      throw new BadRequestException("Invalid login sesssion ");
    }
    //  detect Signiture due to Role
    const secret = this._detectSignitureByRoleAndTokenType(decodedData.role, decodedData.tokenType) as string;

    //  get user id
    const { id } = this._verifyToken({ token, secret }) as IPayloadData & JwtPayload;

    //  get user account
    const userData = await this.userRepository.findById({ id });

    //  check if user account is available
    if (!userData) {
      throw new NotFoundException("invalid user credentials ,please register");
    }

    // ! check if user loggedout
    if (userData.logoutCredentialTime && userData.logoutCredentialTime.getTime() >= (decodedData?.iat as number) * 1000) {
      throw new NotFoundException("Invalid login sesssion");
    }

    return { userData, decodedData };
  }

  private _generateToken({ payload, secret, options }: IGenerateToken): string {
    return jwt.sign(payload, secret, options);
  }

  private _verifyToken({ token, secret, options }: IVerifyToken): JwtPayload | string {
    return jwt.verify(token, secret, options);
  }

  private _detectSignitureByRole(role: RoleEnum = RoleEnum.User): ISigniture {
    const signature: ISigniture = {
      accessSignature: JwtSecrets[role].accessSignature,
      refreshSignature: JwtSecrets[role].refreshSignature,
    };
    return signature;
  }

  private _detectSignitureByRoleAndTokenType(role: RoleEnum | undefined, tokenType = TokenTypeEnum.both): string | ISigniture {
    const signature: ISigniture = this._detectSignitureByRole(role);
    let secret: string | ISigniture;
    switch (tokenType) {
      case TokenTypeEnum.access:
        secret = signature.accessSignature;
        break;
      case TokenTypeEnum.refresh:
        secret = signature.refreshSignature;
        break;
      default:
        secret = signature;
        break;
    }

    return secret;
  }
}

export default TokenService;
