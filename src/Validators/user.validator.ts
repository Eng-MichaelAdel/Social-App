import z from "zod";
import { generalValidators } from "./general.validator";

export const updateProfileShcema = {
  body: z.strictObject({
    firstName: generalValidators.user.shape.firstName.optional(),
    lastName: generalValidators.user.shape.lastName.optional(),
    email: generalValidators.user.shape.email.optional(),
    phone: generalValidators.user.shape.phone.optional(),
    gender: generalValidators.user.shape.gender.optional(),
    DOB: generalValidators.user.shape.DOB.optional(),
  }),
};
