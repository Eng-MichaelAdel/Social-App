import { IUser } from "../../Common";

import { UserRepository } from "../../DB/Repositories";
import { TsighnUpBody } from "../../Validators";
import DataSecurityService from "./../../Common/Services/DataSecurity.service";

class AuthService {
  constructor(
    private userRepository = new UserRepository(),
    private dataSecurityService = new DataSecurityService(),
  ) {}

  async signup(data: TsighnUpBody): Promise<IUser> {
    const result = await this.userRepository.create({ data });
    result.password = await this.dataSecurityService.generateHash(result.password);
    result.confirmedPassword = await this.dataSecurityService.generateHash(result.confirmedPassword);

    if (result.phone) {
      result.phone = this.dataSecurityService.encrypt(result.phone);
    }
    result.save();

    return result;
  }
}

export default new AuthService();
