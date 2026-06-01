import { GenderEnum, RoleEnum } from "../../Common";

export interface ILoginDto {
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    confirmedPassword: string,
    phone: string,
    gender: GenderEnum,
    role: RoleEnum
}