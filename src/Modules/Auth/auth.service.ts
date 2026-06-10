import { ConflictException, IUser, NotFoundException, OtpConextEnum, OtpStateEnum, OtpSubjectEnum, ProviderEnum } from "../../Common";
import { GenerateOtpKeyService, RedisService } from "../../Common/Services";
import { emailEvent, otpTemplate } from "../../Common/Utils/Email";
// import { envConfig } from "../../Config";

import { UserRepository } from "../../DB/Repositories";
import DataSecurityService from "./../../Common/Services/DataSecurity.service";
import { TConfirmEmailDto, TResendConfirmEmailDto, TsighnUpDto } from "./auth.Dto";
import { OtpMsgtitleEnum } from "../../Common/Utils/Email/email.types";

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

// const JwtSecrets = envConfig.JWT;

class AuthService {
  constructor(
    private userRepository: UserRepository = new UserRepository(),
    private dataSecurityService: DataSecurityService = new DataSecurityService(),
    private redisService: RedisService = new RedisService(),
    // private tokenService: TokenService = new TokenService(),
  ) {}

  //* signup
  async signup(userInputs: TsighnUpDto): Promise<IUser> {
    //  check email exist
    const emailExist = await this.userRepository.findOne({
      filter: { email: userInputs.email },
      projection: { email: 1, _id: 0 },
      options: { lean: true },
    });

    if (emailExist) {
      throw new ConflictException("email is already exist");
    }

    //  hash password and confirmed password
    userInputs.password = await this.dataSecurityService.generateHash(userInputs.password);
    userInputs.confirmedPassword = await this.dataSecurityService.generateHash(userInputs.confirmedPassword);

    //  encrypt phone
    if (userInputs.phone) {
      userInputs.phone = this.dataSecurityService.encrypt(userInputs.phone);
    }

    // create and Send Verification OTP mail
    await this.createAndSendOtp({
      email: { to: userInputs.email, cc: "michael_cicilengineer@yahoo.com" },
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
      email: { to: userAccount.email, cc: "michael_cicilengineer@yahoo.com" },
      otp: { otpContext: OtpConextEnum.email, OtpExpInMin: 1, OtpState: OtpStateEnum.resend },
    });

    return;
  }



  private createAndSendOtp = async ({ email: { to, cc, subject, otpMsgTitle }, otp: { otpContext, OtpState, OtpExpInMin } }: ICreateAndSendOtp) => {
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
}
export default new AuthService();
