import { NextFunction, Request, Response } from "express";
import { IDecodeTokenReturn, UnauthorizedException } from "../Common";
import TokenService from "../Common/Services/token.service.js";


const userAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
  //  get access token from headers
  const { authorization } = req.headers;

  //  check if token is sent in headers
  if (!authorization) {
    throw new UnauthorizedException("Authorization token is required");
  }

  //  detect the type of authorization token
  const [prefix, token] = authorization.split(" ");
  if (prefix !== "Bearer") {
    throw new UnauthorizedException("invalid Authorization type , Expected Bearer token");
  }

  //  decode user data according to the authorization type
  const { userData, decodedData } = await decodeTokenByAuthType(prefix, token as string) as IDecodeTokenReturn;

  req.user = userData;
  req.decode = decodedData;

  next();
};

const decodeTokenByAuthType = async (prefix:string, token:string) => {
  const tokenService = new TokenService();
  let userData;
  switch (prefix) {
    case "Basic":
      const [userName, Password] = Buffer.from(token, "base64").toString().split(":");
      userData = { userName, Password };
      break;
    case "Bearer":
      //  decode , verify and return user account
      userData = await tokenService.decodeToken(token);
      break;
    default:
      throw new UnauthorizedException("invalid Authorization type , Expected Bearer token");
      break;
  }

  return userData;
};

export default userAuthenticate