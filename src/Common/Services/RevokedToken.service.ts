import RedisService from "./Redis.service";
import { UUID } from "node:crypto";

class RevokedTokenKeyService {
  constructor(private redisServise = new RedisService()) {}

  private calculateTTL(tokenExpInSec: number): number {
    const currentTimeInSec = Math.floor(Date.now() / 1000);
    return tokenExpInSec - currentTimeInSec;
  }

  RevokenKeyFormat({ id, Jti }: { id: string; Jti: UUID }): string {
    if (!Jti) {
      return `RT_${id}`;
    }
    return `RT_${id}_${Jti}`;
  }

  createBlacklistToken({
    id,
    Jti,
    tokenExpInSec,
  }: {
    id: string;
    Jti: UUID;
    tokenExpInSec: number;
  }): Promise<string | null> | undefined {
    let ttlSeconds = this.calculateTTL(tokenExpInSec);
    if (ttlSeconds <= 0) {
      console.log("Token is already Expired");
      return;
    }
    return this.redisServise.set({ key: this.RevokenKeyFormat({ id, Jti }), value: Jti, options: { EX: ttlSeconds } });
  }
}

export default new RevokedTokenKeyService();
