import mongoose, { Model } from "mongoose";
import { GenderEnum, IUser, ProviderEnum, RoleEnum, StatusEnum } from "../../Common";

const userSchema = new mongoose.Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      minLength: [2, `firstName cannot be less than 2 char .. you entered {VALUE}`],
      maxLength: [25, `secondName cannot be greater than 25 char .. you entered {VALUE}`],
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      minLength: [2, `firstName cannot be less than 2 char .. you entered {VALUE}`],
      maxLength: [25, `secondName cannot be greater than 25 char .. you entered {VALUE}`],
      trim: true,
    },
    email: { type: String, required: true, index: { name: "email_unique", unique: true } },
    password: {
      type: String,
      required: function (this) {
        return this.provider == ProviderEnum.System;
      },
    },
    confirmedPassword: { type: String },
    phone: { type: String },
    DOB: { type: String },
    oldPasswords: [String],

    gender: { type: String, enum: GenderEnum },
    role: { type: String, enum: RoleEnum, default: RoleEnum.User },
    status: { type: String, enum: StatusEnum },
    provider: { type: String, enum: ProviderEnum, default: ProviderEnum.System },

    profielPictuer: { type: String },
    coverProfilePicture: [String],

    googleSub: {
      type: String,
      index: { name: "idx_googleSub_uniqe", unique: true, sparse: true },
    },
    isEmailVerified: { type: Boolean, default: false },

    logoutCredentialTime: { type: Date },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
);

userSchema
  .virtual("userName")
  .get(function () {
    return this.firstName + " " + this.lastName;
  })
  .set(function (value) {
    const [firstName, lastName] = value.split(" ");
    this.set({ firstName, lastName });
  });

const user: Model<IUser> = mongoose.models.user || mongoose.model<IUser>("user", userSchema);

export default user;
