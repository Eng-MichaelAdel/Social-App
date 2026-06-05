import { IUser } from "../../Common";
import { TokenService } from "../../Common/Services";
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
  ) {}

  async signup(data: TsighnUpBody): Promise<IUser> {
    const result = await this.userRepository.create({ data });
    result.password = await this.dataSecurityService.generateHash(result.password);
    result.confirmedPassword = await this.dataSecurityService.generateHash(result.confirmedPassword);

    if (result.phone) {
      result.phone = this.dataSecurityService.encrypt(result.phone);
    }
    result.save();

    const { accessToken, refreshToken } = this.tokenService.createLoginCredentials({
      payload: { id: result.id, email: result.email, role: result.role },
      options: {
        access: { expiresIn: JwtSecrets[result.role].accessExp },
        refresh: { expiresIn: JwtSecrets[result.role].refreshExp },
      },
    });

    console.log({ accessToken, refreshToken });

    const decodedData = await this.tokenService.decodeToken(accessToken as string);
    console.log(decodedData);

    const otp: number = Math.floor(Math.random() * 900000 + 100000);

    emailEvent.emit("sendEmail", {
      to: "engmichael89@gmail.com",
      cc: "michael_civilengineer@yahoo.com",
      subject: "confirm Email",
      html: otpTemplate({ otp, expInMin: 2, title: "confirm" }),
    });
    return result;
  }
}

export default new AuthService();
