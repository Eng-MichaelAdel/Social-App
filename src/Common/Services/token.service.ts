import { envConfig } from "../../Config";
import jwt from "jsonwebtoken";
import type { JwtPayload, PrivateKey, PublicKey, Secret, SignOptions, VerifyOptions } from "jsonwebtoken";
import { RoleEnum, TokenTypeEnum } from "../Enums";
import { BadRequestException, NotFoundException } from "../Utils";
import { UserRepository } from "../../DB/Repositories";

interface IGenerateToken {
  payload: IPayloadData;
  secret: Secret | PrivateKey;
  options?: SignOptions;
}

interface IVerifyToken {
  token: string;
  secret: Secret | PublicKey;
  options?: VerifyOptions & { complete?: false };
}

interface IPayloadData {
  id: string;
  email: string;
  role: RoleEnum;
  tokenType?: TokenTypeEnum;
}

interface ISigniture {
  accessSignature: string;
  refreshSignature: string;
}

interface ICreateLoginCredentials {
  payload: IPayloadData;
  options: {
    access: SignOptions;
    refresh: SignOptions;
  };
  requiredToken?: TokenTypeEnum;
}

interface IReturnLoginCredentials {
  accessToken: string | undefined;
  refreshToken: string | undefined;
}

const JwtSecrets = envConfig.JWT;

class TokenService {
  constructor(private userRepository: UserRepository = new UserRepository()) {}


  createLoginCredentials({ payload, options, requiredToken }: ICreateLoginCredentials): IReturnLoginCredentials {
    let accessToken: string | undefined;
    let refreshToken: string | undefined;

    const detectedSecret: string | ISigniture = this._detectSignitureByRoleAndTokenType(payload.role,requiredToken);
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
                console.log(detectedSecret);

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
    return { accessToken, refreshToken }
  }

  async decodeToken(token: string) {
    //  decode token to get role
    const decodedData = jwt.decode(token) as IPayloadData & JwtPayload;

    //  check id and role are sent through payload
    if (!decodedData?.id || !decodedData?.role) {
      throw new BadRequestException("invalid payload");
    }

    // ! check if there is revoked token
    // if (await get(RevokenKeyFormat(decodedData.id, decodedData.jti))) {
    //   throw new BadRequestException("Invalid login sesssion ,login again");
    // }

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
    // if (userData.logoutCredentialTime && userData.logoutCredentialTime.getTime() >= decodedData.iat * 1000) {
    //   throw new NotFoundException("Invalid login sesssion");
    // }

    return { userData, decodedData };
  }
  
  _generateToken({ payload, secret, options }: IGenerateToken): string {
    return jwt.sign(payload, secret, options);
  }

  _verifyToken({ token, secret, options }: IVerifyToken): JwtPayload | string {
    return jwt.verify(token, secret, options);
  }

  _detectSignitureByRole(role: RoleEnum = RoleEnum.User): ISigniture {
    const signature: ISigniture = {
      accessSignature: JwtSecrets[role].accessSignature,
      refreshSignature: JwtSecrets[role].refreshSignature,
    };
    return signature;
  }

  _detectSignitureByRoleAndTokenType(role: RoleEnum | undefined, tokenType = TokenTypeEnum.both): string | ISigniture {
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
