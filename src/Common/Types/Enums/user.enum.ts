// gender: { type: String, enum: { values: Object.values(genderEnum), message: "{VALUE} is not a valid gender" }, default: genderEnum.male },
// role: { type: String, enum: Object.values(roleEnum), default: roleEnum.user },
// status: { type: String, enum: Object.values(statusEnum), default: statusEnum.active },
// provider: { type: String, enum: Object.values(providerEnum), default: providerEnum.system },

export enum GenderEnum {
  Male = "male",
  Female = "female",
}
export enum RoleEnum {
  User = "user",
  Admin = "admin",
}
export enum StatusEnum {
  Active = "active",
  InActive = "inActive",
}
export enum ProviderEnum {
  System = "system",
  Google = "google",
}

export enum TokenTypeEnum {
  access = "access",
  refresh = "refresh",
  both = "both",
}
