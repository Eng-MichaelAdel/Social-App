import { GenderEnum, ProviderEnum, RoleEnum, StatusEnum } from "../Enums";

export interface IUser {
  firstName: string;
  lastName: string;
  userName?:string
  email: string;
  password: string;
  confirmedPassword: string;
  phone?: string;
  DOB?: string;
  oldPasswords?: string[];

  gender: GenderEnum;
  role: RoleEnum;
  status?: StatusEnum;
  provider: ProviderEnum;

  profielPictuer?: string;
  coverProfilePicture?: string[];

  googleSub?: string;
  isEmailVerified?: boolean;

  logoutCredentialTime: Date;

  createdAt?: string;
  updatedAt?: string;
}
