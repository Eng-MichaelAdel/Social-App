import { IUser } from "../../Common";

import { UserRepository } from "../../DB/Repositories";
import { TsighnUpBody } from "../../Validators";

class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async signup(data: TsighnUpBody): Promise<IUser> {
    const result = await this.userRepository.create({ data });

    return result;
  }
}

export default new AuthService();
