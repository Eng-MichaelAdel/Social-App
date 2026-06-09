import { OtpConextEnum, OtpStateEnum } from "../Enums";

export interface IOtpKeyBaseProperties {
  otpUserData: string;
  otpContext: OtpConextEnum;
  OtpExpInMin: number;
}

export interface ISetBlockKey extends IOtpKeyBaseProperties {
  OtpState: OtpStateEnum;
}

export interface ISetOtpBaseKey extends IOtpKeyBaseProperties {
  otpValue: number;
}

export interface ISetMaxTrialsKey extends ISetBlockKey {}

export interface ICheckOtpValidation {
  otpUserData: string;
  otpContext: OtpConextEnum;
  OtpState: OtpStateEnum;
}

export interface ISetAllOtpKeysToDatabase extends IOtpKeyBaseProperties {
  otpValue: number;
  OtpState: OtpStateEnum;
}

export interface IVerifyOtp {
  otpValue: number;
  otpUserData: string;
  otpContext: OtpConextEnum;
}
