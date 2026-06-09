import { IUser, OtpConextEnum, OtpStateEnum } from "../../Common";
import { TokenService } from "../../Common/Services";
import GenerateKeyService from "../../Common/Services/GenerateKeys.service";
import { emailEvent, otpTemplate } from "../../Common/Utils/Email";
import { envConfig } from "../../Config";

import { UserRepository } from "../../DB/Repositories";
import { TsighnUpBody } from "../../Validators";
import DataSecurityService from "./../../Common/Services/DataSecurity.service";

const JwtSecrets = envConfig.JWT;

class AuthService {
  constructor(
    private userRepository = new UserRepository(),
    private dataSecurityService = new DataSecurityService(),
    private tokenService = new TokenService(),
    private generateKeysService = new GenerateKeyService(),
  ) {}

  async signup(data: TsighnUpBody): Promise<IUser> {
    const user = await this.userRepository.create({ data });
    user.password = await this.dataSecurityService.generateHash(user.password);
    user.confirmedPassword = await this.dataSecurityService.generateHash(user.confirmedPassword);

    if (user.phone) {
      user.phone = this.dataSecurityService.encrypt(user.phone);
    }
    user.save();

    const { accessToken, refreshToken } = this.tokenService.createLoginCredentials({
      payload: { id: user.id, email: user.email, role: user.role },
      options: {
        access: { expiresIn: JwtSecrets[user.role].accessExp },
        refresh: { expiresIn: JwtSecrets[user.role].refreshExp },
      },
    });

    console.log({ accessToken, refreshToken });

    const decodedData = await this.tokenService.decodeToken(accessToken as string);
    console.log(decodedData);

    const otp: number = this.generateKeysService.generateOtpValue();

    emailEvent.emit("sendEmail", {
      to: "engmichael89@gmail.com",
      cc: "michael_civilengineer@yahoo.com",
      subject: "confirm Email",
      html: otpTemplate({ otp, expInMin: 2, title: "confirm" }),
    });

    this.generateKeysService.setAllOtpKeysToDatabase({
      otpValue: otp,
      otpUserData: user.email,
      otpContext: OtpConextEnum.email,
      OtpExpInMin: 2,
      OtpState: OtpStateEnum.new,
    });
    return user;
  }
}

export default new AuthService();
