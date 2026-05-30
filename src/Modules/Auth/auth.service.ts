import { ILoginDto } from "./auth.Dto";

class AuthService {
  login(body: any): ILoginDto {
    return body;
  }
}

export default new AuthService();
