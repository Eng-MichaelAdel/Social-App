import { ILoginDto } from "./auth.Dto";
import { IUser } from "../../Common";

import { UserRepository } from "../../DB/Repositories";

class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async signup(data: ILoginDto): Promise<IUser> {
    const result = await this.userRepository.create({ data });

    return result;
  }
}

export default new AuthService();
