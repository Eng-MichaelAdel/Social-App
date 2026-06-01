import { GenderEnum, ProviderEnum, RoleEnum, StatusEnum } from "../Enums";

export interface IUser {
  firstName: string;
  lastName: string;
  userName?:string
  email: string;
  password: string;
  confirmedPassword?: String;
  phone?: String;
  DOB?: Date;
  oldPasswords?: String[];

  gender: GenderEnum;
  role: RoleEnum;
  status?: StatusEnum;
  provider: ProviderEnum;

  profielPictuer?: String;
  coverProfilePicture?: String[];

  googleSub?: string;
  isEmailVerified?: boolean;

  logoutCredentialTime: Date;

  createdAt?: string;
  updatedAt?: string;
}
