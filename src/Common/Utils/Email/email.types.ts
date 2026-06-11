export interface ITemplateData {
  otp: number;
  expInMin: number;
  title: string | OtpMsgtitleEnum;
}

export enum OtpMsgtitleEnum {
  newOtp = "Verification Code",
  resendOtp = "Reset Code",
}

export enum EmailSubject {
  email = "Confirm Email",
  password = "Forget Password",
}
