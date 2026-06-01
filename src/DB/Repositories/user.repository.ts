import { IUser } from "../../Common";
import { userModel } from "../Models";
import BaseRepository from "./base.repository";

class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(userModel);
  }
}

export default UserRepository;