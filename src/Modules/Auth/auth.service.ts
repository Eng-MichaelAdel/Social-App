import { IUser } from "../../Common";
import { TokenService } from "../../Common/Services";
import { envConfig } from "../../Config";

import { UserRepository } from "../../DB/Repositories";
import { TsighnUpBody } from "../../Validators";
import DataSecurityService from "./../../Common/Services/DataSecurity.service";

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

    const {accessToken,refreshToken} = this.tokenService.createLoginCredentials({
      payload: { id: result.id, email: result.email, role: result.role },
      options: {
        access: { expiresIn: envConfig.JWT[result.role].accessExp },
        refresh: { expiresIn: envConfig.JWT[result.role].refreshExp },
      },
    });


    console.log({accessToken,refreshToken});

    const decodedData = await this.tokenService.decodeToken(accessToken as string)
    console.log(decodedData);
    
    
    return result;
  }
}

export default new AuthService();
