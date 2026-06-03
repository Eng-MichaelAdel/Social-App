import * as z from "zod";
import { GenderEnum, ProviderEnum, RoleEnum, StatusEnum } from "../Common";
import { isValidObjectId } from "mongoose";

export const generalValidators = {
  user: z.object({
    id: z.stringFormat("checkObjId", (vaL) => {
      return isValidObjectId(vaL);
    }),
    firstName: z
      .string()
      .toLowerCase()
      .min(2, { message: "firstName Must be at least 2 character" })
      .max(25, { message: "firstName Must not exceed 25 character" })
      .trim(),
    lastName: z
      .string()
      .toLowerCase()
      .min(2, { message: "lastName Must be at least 2 character" })
      .max(25, { message: "lastName Must not exceed 25 character" })
      .trim(),
    email: z.email({ message: "Email must be a valid email address , example :example@anything.any" }),
    password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/, {
      message: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
    }),
    confirmedPassword: z.string(),
    phone: z.string().regex(/^01(0|1|2|5)\d{8}$/, { message: "Phone number must be a valid number (11 digits)" }),
    DOB: z.iso.date(),
    oldPasswords: z.array(z.string()),

    gender: z.enum(GenderEnum),
    role: z.enum(RoleEnum).default(RoleEnum.User),
    status: z.enum(StatusEnum),
    provider: z.enum(ProviderEnum).default(ProviderEnum.System),

    profielPictuer: z.string(),
    coverProfilePicture: z.array(z.string()),
    googleSub: z.string(),
    isEmailVerified: z.boolean(),
    logoutCredentialTime: z.date(),
  }),
};


