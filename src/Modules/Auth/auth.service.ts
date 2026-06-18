import { envConfig } from "../../Config";
import {
  ConflictException,
  IPayloadData,
  IUser,
  NotFoundException,
  OtpConextEnum,
  OtpStateEnum,
  OtpSubjectEnum,
  ProviderEnum,
  UnauthorizedException,
  verifyGcpIdToken,
} from "../../Common";
import { GenerateOtpKeyService, RedisService, RevokedTokenKeyService, TokenService } from "../../Common/Services";
import { emailEvent, otpTemplate } from "../../Common/Utils/Email";
import { UserRepository } from "../../DB/Repositories";
import DataSecurityService from "./../../Common/Services/DataSecurity.service";
import { TConfirmEmailDto, TLoginSchemaDto, TLogoutServiceDto, TResendConfirmEmailDto, TResetForgotPasswordDto, TsighnUpDto } from "./auth.Dto";
import { OtpMsgtitleEnum } from "../../Common/Utils/Email/email.types";
import { randomUUID } from "node:crypto";
import { JwtPayload } from "jsonwebtoken";
import { TokenPayload } from "google-auth-library";
import { HydratedDocument } from "mongoose";

interface ICreateAndSendOtp {
  email: {
    to: string;
    cc?: string;
    subject?: string;
    otpMsgTitle?: string;
  };
  otp: {
    otpContext: OtpConextEnum;
    OtpExpInMin: number;
    OtpState: OtpStateEnum;
  };
}

const JwtSecrets = envConfig.JWT;

class AuthService {
  constructor(
    private userRepository: UserRepository = new UserRepository(),
    private dataSecurityService: DataSecurityService = new DataSecurityService(),
    private redisService: RedisService = new RedisService(),
    private tokenService: TokenService = new TokenService(),
  ) {}

  //* signup
  async signup(userInputs: TsighnUpDto): Promise<IUser> {
    //  check email exist
    const userExist = await this.userRepository.findOne({
      filter: { email: userInputs.email },
    });

    if (userExist && userExist.provider.includes(ProviderEnum.System)) {
      throw new ConflictException("email is already registered");
    }

    // so ther is an account already created by providers like google , facebookr ..etc
    // so just update the account
    if (userExist && userExist.provider.length !== 0) {
      userExist.password = userInputs.password;
      userExist.confirmedPassword = userInputs.confirmedPassword;
      userExist.phone = userInputs.phone;
      userExist.gender = userInputs.gender;
      userExist.DOB = userInputs.DOB;
      userExist.provider.push(ProviderEnum.System);
      userExist.save();
      return userExist;
    }

    // create and Send Verification OTP mail
    await this.createAndSendOtp({
      email: { to: userInputs.email, cc: "michael_civilengineer@yahoo.com" },
      otp: { otpContext: OtpConextEnum.email, OtpExpInMin: 1, OtpState: OtpStateEnum.new },
    });

    //  create user
    const user = await this.userRepository.create({ data: userInputs });
    return user;
  }

  //* Confirm Email
  async verifyEmailService(body: TConfirmEmailDto): Promise<void> {
    const { email, otp } = body;

    // check user account is on DB
    const userExist = await this.userRepository.findOne({ filter: { email, provider: ProviderEnum.System, isEmailVerified: false } });
    if (!userExist) {
      throw new NotFoundException("Fail to find matching account");
    }

    // Verifying OTP and check the expiration (not expired)
    await GenerateOtpKeyService.verifyOtp({ otpValue: otp, otpUserData: email, otpContext: OtpConextEnum.email });

    // delete the saved OTP keys
    const OtpKeys = await this.redisService.keys(GenerateOtpKeyService.baseOtpKey({ otpUserData: email, otpContext: OtpConextEnum.email }));
    await this.redisService.del(OtpKeys);

    // apply confirmation to DB user account
    userExist.isEmailVerified = true;
    await userExist.save();
    return;
  }

  //* Resend OTP Email
  async resendRerifyEmailService(body: TResendConfirmEmailDto) {
    const { email } = body;

    // check user account is on DB
    const userAccount = await this.userRepository.findOne({ filter: { email, provider: ProviderEnum.System, isEmailVerified: false } });
    if (!userAccount) {
      throw new NotFoundException("Fail to find matching account");
    }

    // create and Send Verification OTP mail
    await this.createAndSendOtp({
      email: { to: userAccount.email, cc: "michael_civilengineer@yahoo.com" },
      otp: { otpContext: OtpConextEnum.email, OtpExpInMin: 1, OtpState: OtpStateEnum.resend },
    });

    return;
  }

  //* login
  async login(userInputs: TLoginSchemaDto, issuer: string) {
    const { email, password } = userInputs;

    //  check login credintial's validation
    const user = await this.userRepository.findOne({ filter: { email, isEmailVerified: true } });
    if (!user || !(await this.dataSecurityService.compareHash(password, user.password))) {
      throw new UnauthorizedException("Invalid Login Credentials", {});
    }

    //  generate access and refresh token
    const { accessToken, refreshToken } = this.buildTokens(user, issuer);

    return { accessToken, refreshToken };
  }

  // * Refresh Token
  refreshTokenService(decodedData: JwtPayload, issuer: string) {
    //  check if the sent token is refresh one
    if (decodedData.tokenType !== "refresh") {
      throw new UnauthorizedException("invalid token type ,expected refresh token");
    }

    //  stop generating new access token until the created one is expired
    const expOfAccessToken = JwtSecrets[decodedData.role].accessExp;
    if (((decodedData.iat as number) + expOfAccessToken) * 1000 > Date.now()) {
      throw new ConflictException("current acces token is still valid");
    }

    //  create access and refresh token
    const { accessToken, refreshToken } = this.buildTokens(decodedData, issuer);

    //  added the used refresh token as revoked one
    const { id: refreshUserId, jti: refreshJti, exp: refreshExp } = decodedData;
    RevokedTokenKeyService.createBlacklistToken({ id: refreshUserId, Jti: refreshJti as string, tokenExpInSec: refreshExp as number });

    return { accessToken, refreshToken };
  }

  //* Request ForgotPassword Code
  async requestForgetPasswordCode(body: { email: string }) {
    const { email } = body;

    // check user account is on DB
    const userAccount = await this.userRepository.findOne({ filter: { email, provider: ProviderEnum.System, isEmailVerified: true } });
    if (!userAccount) {
      throw new NotFoundException("user is not Regestered");
    }

    // create and Send Verification OTP mail
    await this.createAndSendOtp({
      email: { to: userAccount.email, cc: "michael_civilengineer@yahoo.com" },
      otp: { otpContext: OtpConextEnum.password, OtpExpInMin: 1, OtpState: OtpStateEnum.resend },
    });

    return;
  }

  //* Verify ForgotPassword Code
  async verifyForgetPasswordCode(body: TConfirmEmailDto) {
    const { email, otp } = body;

    // Verifying OTP and check the expiration (not expired)
    await GenerateOtpKeyService.verifyOtp({ otpValue: otp, otpUserData: email, otpContext: OtpConextEnum.password });

    return;
  }

  //* reset ForgotPassword Code
  async resetForgetPassword(body: TResetForgotPasswordDto) {
    const { email, otp, password, confirmedPassword } = body;

    // Verifying OTP and check the expiration (not expired)
    await GenerateOtpKeyService.verifyOtp({ otpValue: otp, otpUserData: email, otpContext: OtpConextEnum.password });

    // check user account and update password on DB
    const userAccount = await this.userRepository.findOneAndUpdate({
      filter: { email, provider: ProviderEnum.System, isEmailVerified: true },
      update: {
        password: await this.dataSecurityService.generateHash(password),
        confirmedPassword: await this.dataSecurityService.generateHash(confirmedPassword),
        logoutCredentialTime: Date.now(),
      },
    });
    if (!userAccount) {
      throw new NotFoundException("user is not Regestered");
    }

    // delete the saved OTP keys
    const otpKeys = await this.redisService.keys(GenerateOtpKeyService.baseOtpKey({ otpUserData: email, otpContext: OtpConextEnum.password }));
    const existsRevokedKeys = await this.redisService.keys(`${RevokedTokenKeyService.RevokenKeyFormat({ id: userAccount.id as string })}*`);
    this.redisService.del([...otpKeys, ...existsRevokedKeys]);

    return;
  }

  // * Logout
  async logoutService({ userAccount, accessDecodedData, refreshToken, logoutFromAll }: TLogoutServiceDto) {
    switch (logoutFromAll) {
      case true:
        userAccount.logoutCredentialTime = new Date();
        await userAccount.save();
        const existsRevokedKeys = await this.redisService.keys(`${RevokedTokenKeyService.RevokenKeyFormat({ id: userAccount.id })}`);
        await this.redisService.del(existsRevokedKeys);
        return "logout is done successfully from all devices";

      default:
        const { decodedData: refreshDecodedData } = await this.tokenService.decodeToken(refreshToken as string);
        if (accessDecodedData.id !== refreshDecodedData.id) {
          throw new UnauthorizedException("ACCESS_REFRESH_MISMATCH");
        }
        const { id: accessUserId, jti: accessJti, exp: accessExp } = accessDecodedData;
        const { id: refreshUserId, jti: refreshJti, exp: refreshExp } = refreshDecodedData;

        Promise.all([
          RevokedTokenKeyService.createBlacklistToken({ id: accessUserId, Jti: accessJti as string, tokenExpInSec: accessExp as number }),
          RevokedTokenKeyService.createBlacklistToken({ id: refreshUserId, Jti: refreshJti as string, tokenExpInSec: refreshExp as number }),
        ]);

        return "logout is done successfully from your device";
    }
  }

  // * Gmail Registertion
  async gmailRegisterService(idToken: string, issuer: string) {
    // verify gcp idToken
    const payload = await verifyGcpIdToken(idToken);

    //  find if the accunt is exist
    const user = await this.userRepository.findOne({
      filter: {
        $or: [{ googleSub: payload.sub }, { email: payload.email as string }],
      },
    });

    //  update the user account if exist else create a new one
    const userData = await this.handleUpdateOrCreateGoogleAccount(user, payload);

    //  generate access and refresh token
    const { accessToken, refreshToken } = this.buildTokens(userData as IUser, issuer);

    return { accessToken, refreshToken };
  }

  // * Gmail Login
  async gmailLogInService(idToken: string, issuer: string) {
    // verify gcp idToken
    const payload = await verifyGcpIdToken(idToken);

    //  find if the accunt is exist
    const user = await this.userRepository.findOne({
      filter: { $or: [{ googleSub: payload.sub }, { email: payload.email as string }] },
    });

    if (!user) {
      throw new NotFoundException("user not registered");
    }

    //  generate access and refresh token
    const { accessToken, refreshToken } = this.buildTokens(user, issuer);

    return { accessToken, refreshToken };
  }

  // ^--------------------------------------------------------------------------------------------------------------------------------------------^ //

buildTokens(userData: IUser | IPayloadData, issuer: string) {
    const Credentials = this.tokenService.createLoginCredentials({
      payload: { id: userData.id as string, email: userData.email, role: userData.role },
      options: {
        access: { expiresIn: JwtSecrets[userData.role].accessExp, jwtid: randomUUID(), issuer, audience: ["web", "mobile"] },
        refresh: { expiresIn: JwtSecrets[userData.role].refreshExp, jwtid: randomUUID(), issuer, audience: ["web", "mobile"] },
      },
    });
    return Credentials;
  }

  createAndSendOtp = async ({ email: { to, cc, subject, otpMsgTitle }, otp: { otpContext, OtpState, OtpExpInMin } }: ICreateAndSendOtp) => {
    // if resending new Otp .. check blocking or max trials first
    await GenerateOtpKeyService.CheckValidationOfAllOtp({ otpUserData: to, otpContext, OtpState });

    // then create otp send email by the code
    const otp = GenerateOtpKeyService.generateOtpValue();
    emailEvent.emit("sendEmail", {
      to,
      cc,
      subject: subject ?? OtpSubjectEnum[otpContext],
      html: otpTemplate({ otp, expInMin: OtpExpInMin, title: otpMsgTitle ?? OtpMsgtitleEnum[OtpState] }),
    });

    // save the otp Keys to database
    GenerateOtpKeyService.setAllOtpKeysToDatabase({ otpValue: otp, otpUserData: to, otpContext, OtpState, OtpExpInMin });
    return;
  };

  private handleUpdateOrCreateGoogleAccount = async (user: HydratedDocument<IUser> | null, payload: TokenPayload) => {
    const { given_name, family_name, email, picture, sub } = payload;
    if (user) {
      user.firstName = given_name as string;
      user.lastName = family_name as string;
      user.email = email as string;
      user.profielPictuer = picture as string;
      if (!user.provider.includes(ProviderEnum.Google)) {
        user.provider.push(ProviderEnum.Google);
        user.googleSub = sub as string;
      }

      await user.save();
      return user;
    } else {
      return await this.userRepository.create({
        data: {
          googleSub: sub as string,
          firstName: given_name as string,
          lastName: family_name as string,
          email: email as string,
          profielPictuer: picture as string,
          // password: hashedPassword,
          // confirmedPassword: hashedPassword,
          provider: [ProviderEnum.Google],
        },
      });
    }
  };
}
export default new AuthService();
