import { HydratedDocument } from "mongoose";
import { DataSecurityService, RedisService, TokenService } from "../../Common/Services";
import { envConfig } from "../../Config";
import { UserRepository } from "../../DB/Repositories";
import { ConflictException, IUser } from "../../Common";
import { TUpdateProfileShcemaDto } from "./user.Dto";

const JwtSecrets = envConfig.JWT;

class UserService {
  constructor(
    private userRepository: UserRepository = new UserRepository(),
    private dataSecurityService: DataSecurityService = new DataSecurityService(),
    private redisService: RedisService = new RedisService(),
    private tokenService: TokenService = new TokenService(),
  ) {}

  // * get Profile
  async getUserProfile(userProfile: HydratedDocument<IUser>) {
    if (userProfile.phone) {
      //  decrypt phone no
      userProfile.phone = this.dataSecurityService.decrypt(userProfile.phone);
    }

    return userProfile;
  }

  // * update Profile
  async updateProfile(userProfile: HydratedDocument<IUser>, updateData: TUpdateProfileShcemaDto) {
    //  get user id
    const { _id } = userProfile;

    //  check if email already exist in another account
    if (updateData.email) {
      const emailExist = await this.userRepository.findOne({ filter: { email: updateData.email }, projection: { email: 1 } });

      if (emailExist && emailExist.id !== _id.toString()) {
        throw new ConflictException("email is already exist");
      }
    }

    //  check if phone is sent as required for update?? so apply encryption
    if (updateData.phone) {
        
      updateData.phone = this.dataSecurityService.encrypt(updateData.phone);
    }

    //  save all updates and get updated profile data
    const updatedProfile = await this.userRepository.findByIdAndUpdate({ id: _id, update: { ...updateData } });

    //  decrypt phone number for representation of the profile
    if (updatedProfile && updatedProfile.phone) {        
      updatedProfile.phone = this.dataSecurityService.decrypt(updatedProfile.phone);

    }
    

    return updatedProfile;
  }

  //   // * update Password
  //   async updatePassword(passwordData, userAccount, issuer) {
  //     const { oldPassword, newPassword, confirmNewPassword } = passwordData;
  //     const { password: hashedPassword } = userAccount;

  //     // check if the old password entered is matching the user password
  //     const isPasswordMatched = await compareHash(oldPassword, hashedPassword);
  //     if (!isPasswordMatched) {
  //       throw new UnauthorizedException("Incorrect Current Password");
  //     }

  //     for (const hash of userAccount.oldPasswords) {
  //       if (await compareHash(newPassword, hash)) {
  //         throw new ConflictException("this password is already used before");
  //       }
  //     }

  //     // update Password and logeout from all devices
  //     userAccount.password = await generateHash(newPassword);
  //     userAccount.oldPasswords.push(userAccount.password);
  //     userAccount.confirmedPassword = await generateHash(confirmNewPassword);
  //     userAccount.logoutCredentialTime = Date.now();
  //     await userAccount.save();

  //     // delete the saved RevokedKeys keys
  //     const existsRevokedKeys = await keys(`${baseRT_key(userAccount._id)}*`);
  //     del([...existsRevokedKeys]);

  //     return buildTokens(userAccount, issuer);
  //   }

  //   // * update Profile Pic
  //   async uploadProfilePic(userProfile, fileData) {
  //     //  get user id
  //     const { _id } = userProfile;

  //     if (!fileData || !fileData.path) {
  //       throw new BadRequestException("File is required");
  //     }

  //     //  update profile pic and return the updated user profile
  //     const updatedProfile = await userRepositories.findByIdAndUpdate({ id: _id, updates: { profielPictuer: fileData.path } });
  //     return updatedProfile;
  //   }

  //   // * update Profile cover Pics
  //   async uploadProfileCover(userProfile, fileData) {
  //     //  get user id
  //     const { _id } = userProfile;

  //     if (!fileData) {
  //       throw new BadRequestException("File is required");
  //     }

  //     const coverPicPaths = fileData.map(({ path }) => {
  //       return path;
  //     });

  //     //  update profile pic and return the updated user profile
  //     const updatedProfile = await userRepositories.findByIdAndUpdate({ id: _id, updates: { coverProfilePicture: coverPicPaths } });
  //     return updatedProfile;
  //   }

  //   // * get Shared Profile
  //   async getSharedProfile(userId) {
  //     const userProfile = await userRepositories.findById({ id: userId });
  //     if (!userProfile) {
  //       throw new BadRequestException("Invalid userId , user is not found");
  //     }
  //     return userProfile;
  //   }

  //   // * Delete account
  //   async deleteUserAccount(userProfile) {
  //     //  get the user id from the user profile
  //     const { _id } = userProfile;

  //     const session = await mongoose.startSession();
  //     return (await session).withTransaction(async () => {
  //       //  delete all user messages
  //       await messageRepositories.deleteMany({ filter: { receverId: _id }, options: { session } });
  //       //  delete account
  //       await userRepositories.findByIdAndDelete({ id: _id, options: { session } });
  //     });
  //   }
}
export default new UserService();
