import {
  ICheckOtpValidation,
  ISetAllOtpKeysToDatabase,
  ISetBlockKey,
  ISetMaxTrialsKey,
  ISetOtpBaseKey,
  IVerifyOtp,
  OtpConextEnum,
  OtpStateEnum,
  OtpSubjectEnum,
} from "../Types";
import RedisService from "./Redis.service";
import DataSecurityService from "./DataSecurity.service";
import { BadRequestException, ConflictException, NotFoundException } from "../Utils";

class GenerateOtpKeyService {
  constructor(
    private dataSecurityService = new DataSecurityService(),
    private redisServise = new RedisService(),
  ) {}

 baseOtpKey({ otpUserData, otpContext }: { otpUserData: string; otpContext?: OtpConextEnum }): string {
    if (!otpContext) {
      return `OTP::${otpUserData}`;
    }

    const otpSubject = OtpSubjectEnum[otpContext];
    return `OTP::${otpUserData}::${otpSubject}`;
  }

  private maxAttempOtpKey({ otpUserData, otpContext }: { otpUserData: string; otpContext: OtpConextEnum }): string {
    return `${this.baseOtpKey({ otpUserData, otpContext })}::MaxTrial`;
  }

  private blockOtpKey({ otpUserData, otpContext }: { otpUserData: string; otpContext: OtpConextEnum }): string {
    return `${this.baseOtpKey({ otpUserData, otpContext })}::Block`;
  }

  private async setOtpBaseKey({ otpValue, otpUserData, otpContext, OtpExpInMin }: ISetOtpBaseKey): Promise<void> {
    await this.redisServise.set({
      key: this.baseOtpKey({ otpUserData, otpContext }),
      value: await this.dataSecurityService.generateHash(`${otpValue}`),
      options: { EX: OtpExpInMin * 60 },
    });

    return;
  }

  private async handleSetOrIncrMaxTrialKey({ otpUserData, otpContext, OtpExpInMin, OtpState }: ISetMaxTrialsKey): Promise<void> {
    // initiate the max trial key
    const maxTrialKey = this.maxAttempOtpKey({ otpUserData, otpContext });

    // check if there is the first initiation for the MaxTrial key or it is due to resend OTP
    switch (OtpState) {
      case OtpStateEnum.resend:
        // if it is due to resend ... so just apply increment
        const maxTrialsCount = await this.redisServise.incr(maxTrialKey);
        // handle the point if the state = resendOTP and these is the first time to set MaxTrial Key through the resend condition
        // so there will not be Expiration applied by incr method
        // case of forget password "the first MaxTrial key is applied through resendOTP"
        if (maxTrialsCount === 1) {
          await this.redisServise.expire({ key: maxTrialKey, ttl: OtpExpInMin * 3 * 60 });
        }
        // check if reached max trials ... so apply Block key
        // check if the user ruin the max trials and is blocked

        if (maxTrialsCount >= 3) {
          const BlockTime = await this.redisServise.ttl(maxTrialKey);
          await this.setBlockKey({ otpUserData, otpContext, OtpExpInMin: BlockTime / 60, OtpState });
        }
        break;
      case OtpStateEnum.new:
        this.redisServise.set({ key: maxTrialKey, value: 1, options: { EX: OtpExpInMin * 3 * 60 } });
        break;
    }
  }

  private async setBlockKey({ otpUserData, otpContext, OtpExpInMin, OtpState }: ISetBlockKey): Promise<void> {
    if (OtpState === OtpStateEnum.resend) {
      await this.redisServise.set({
        key: this.blockOtpKey({ otpUserData, otpContext }),
        value: "Blocked",
        options: { EX: OtpExpInMin * 60 },
      });
    }
    return;
  }

  async CheckValidationOfAllOtp({ otpUserData, otpContext, OtpState }: ICheckOtpValidation): Promise<void> {
    if (OtpState === OtpStateEnum.resend) {
      // check if the user ruin the max trials and is blocked
      const [BlockKey, BlockTime] = await Promise.all([
        this.redisServise.get(this.blockOtpKey({ otpUserData, otpContext })),
        this.redisServise.ttl(this.blockOtpKey({ otpUserData, otpContext })),
      ]);
      if (BlockKey) {
        throw new BadRequestException(
          `your account is Blocked ,sorry we can't request a new OTP "you reached the max trials" ,, please try again after ${BlockTime} sec.`,
        );
      }

      // check if the existance OTP is valid or expired
      const remainingOtpTTL = await this.redisServise.ttl(this.baseOtpKey({ otpUserData, otpContext }));
      if (remainingOtpTTL > 0) {
        throw new BadRequestException(
          `sorry we can't request a new OTP while the current OTP is still valid ,, please try again after ${remainingOtpTTL} sec.`,
        );
      }
    }
  }

  async setAllOtpKeysToDatabase({ otpValue, otpUserData, otpContext, OtpExpInMin, OtpState }: ISetAllOtpKeysToDatabase): Promise<void> {
    await this.setOtpBaseKey({ otpValue, otpUserData, otpContext, OtpExpInMin });
    await this.handleSetOrIncrMaxTrialKey({ otpUserData, otpContext, OtpExpInMin, OtpState });
  }

  generateOtpValue(): number {
    return Math.floor(Math.random() * 900000 + 100000);
  }

  async verifyOtp({ otpValue, otpUserData, otpContext }: IVerifyOtp): Promise<void> {
    // check existance of OTP for these user (not expired)
    const hashedOtp = await this.redisServise.get(this.baseOtpKey({ otpUserData, otpContext }));
    if (!hashedOtp) {
      throw new NotFoundException("OTP is Expired");
    }

    // check verify the OTP
    if (!(await this.dataSecurityService.compareHash(`${otpValue}`, hashedOtp))) {
      throw new ConflictException("Invalid OTP");
    }

    return;
  }


}

export default new GenerateOtpKeyService();
