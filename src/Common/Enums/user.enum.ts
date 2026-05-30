// gender: { type: String, enum: { values: Object.values(genderEnum), message: "{VALUE} is not a valid gender" }, default: genderEnum.male },
// role: { type: String, enum: Object.values(roleEnum), default: roleEnum.user },
// status: { type: String, enum: Object.values(statusEnum), default: statusEnum.active },
// provider: { type: String, enum: Object.values(providerEnum), default: providerEnum.system },

export enum GenderEnum {
  Male = "Male",
  Female = "Female",
}
export enum RoleEnum {
  User = "User",
  Admin = "Admin",
}
export enum StatusEnum {
  Active = "Active",
  InActive = "InActive",
}
export enum ProviderEnum {
  System = "System",
  Google = "Google",
}
