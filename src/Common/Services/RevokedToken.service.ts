import RedisService from "./Redis.service";
import { UUID } from "node:crypto";

class RevokedTokenKeyService {
  constructor(private redisServise = new RedisService()) {}

  private calculateTTL(tokenExpInSec: number): number {
    const currentTimeInSec = Math.floor(Date.now() / 1000);
    return tokenExpInSec - currentTimeInSec;
  }

  private RevokenKeyFormat({ keyData, KeyValue }: { keyData: string; KeyValue: UUID }): string {
    if (!KeyValue) {
      return `RT_${keyData}`;
    }
    return `RT_${keyData}_${KeyValue}`;
  }

  createBlacklistToken({
    keyData,
    KeyValue,
    tokenExpInSec,
  }: {
    keyData: string;
    KeyValue: UUID;
    tokenExpInSec: number;
  }): Promise<string | null> | undefined {
    let ttlSeconds = this.calculateTTL(tokenExpInSec);
    if (ttlSeconds <= 0) {
      console.log("Token is already Expired");
      return;
    }
    return this.redisServise.set({ key: this.RevokenKeyFormat({ keyData, KeyValue }), value: KeyValue, options: { EX: ttlSeconds } });
  }
}

export default RevokedTokenKeyService;
