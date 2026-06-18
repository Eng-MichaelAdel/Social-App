import mongoose, { Model } from "mongoose";
import { GenderEnum, IUser, OtpConextEnum, OtpStateEnum, ProviderEnum, RoleEnum, StatusEnum } from "../../Common";
import { DataSecurityService } from "../../Common/Services";
import authService from "../../Modules/Auth/auth.service";

const dataSecurityService = new DataSecurityService();

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
        return this.provider.at(-1) == ProviderEnum.System;
      },
    },
    confirmedPassword: { type: String },
    phone: { type: String },
    DOB: { type: String },
    oldPasswords: { type: [String], default: [] },

    gender: { type: String, enum: GenderEnum },
    role: { type: String, enum: RoleEnum, default: RoleEnum.User },
    status: { type: String, enum: StatusEnum },
    provider: { type: [{ type: String, enum: ProviderEnum }], default: [ProviderEnum.System] },

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

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await dataSecurityService.generateHash(this.password);
    this.oldPasswords.push(this.password);
    if (this.oldPasswords.length > 5) this.oldPasswords = this.oldPasswords.slice(-5);
  }
  if (this.isModified("confirmedPassword")) {
    this.confirmedPassword = await dataSecurityService.generateHash(this.confirmedPassword);
  }
  if (this.phone && this.isModified("phone")) {
    this.phone = dataSecurityService.encrypt(this.phone);
  }
});

userSchema.post("save", async function () {
  if (this.provider.at(-1) == ProviderEnum.System && this.isEmailVerified === false) {
    // create and Send Verification OTP mail
    await authService.createAndSendOtp({
      email: { to: this.email, cc: "michael_civilengineer@yahoo.com" },
      otp: { otpContext: OtpConextEnum.email, OtpExpInMin: 1, OtpState: OtpStateEnum.new },
    });
  }
});

const user: Model<IUser> = mongoose.models.user || mongoose.model<IUser>("user", userSchema);

export default user;
