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

export const updatePasswordSchema = {
  body: z
    .object({
      oldPassword: generalValidators.user.shape.password,
      newPassword: generalValidators.user.shape.password,
      confirmNewPassword: z.string(),
    })
    .superRefine((data, ctx) => {
      if (data.newPassword === data.oldPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["newPassword"],
          message: "New password must be different from old password",
        });
      }

      if (data.confirmNewPassword !== data.newPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmNewPassword"],
          message: "new Passwords doesn't match",
        });
      }
    }),
};

export const SharedProfileSchema = {
  params: z.object({
    userId: generalValidators.user.shape.id,
  }),
};