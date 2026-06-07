import { createClient, RedisArgument, RedisClientType, SetOptions } from "redis";
import { envConfig } from "../../Config";
import { BadRequestException } from "../Utils";

const RedisUrl = envConfig.REDIS.URL;

interface IRedisSet {
  key: string;
  value: number | RedisArgument;
  options?: SetOptions;
}

class RedisService {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({ url: RedisUrl });
  }

  async connect() {
    try {
      await this.client.connect();
      console.log("Redis Database is connected 💕");
    } catch (error) {
      console.log("Unable to connect to the redis database ❌", error);
    }
  }

  set({ key, value, options }: IRedisSet): Promise<string | null> {
    try {
      return this.client.set(key, value, options);
    } catch (error) {
      throw new BadRequestException("fail in Redis SET Opreration", error);
    }
  }

  async update({ key, value, options }: IRedisSet): Promise<string | null> {
    try {
      if (!(await this.client.get(key))) {
        return null;
      }
      return this.client.set(key, value, options);
    } catch (error) {
      throw new BadRequestException("fail in Redis update Opreration", error);
    }
  }

  get(key: string): Promise<string | null> {
    try {
      return this.client.get(key);
    } catch (error) {
      throw new BadRequestException("fail in Redis GET Opreration", error);
    }
  }

  mget(keys: string[]): Promise<(string | null)[]> {
    try {
      if (!keys.length) {
        throw new BadRequestException("Please enter a valid keys");
      }
      return this.client.mGet(keys);
    } catch (error) {
      throw new BadRequestException("fail in Redis MGET Opreration", error);
    }
  }

  ttl(key: string): Promise<Number> {
    try {
      return this.client.ttl(key);
    } catch (error) {
      throw new BadRequestException("fail in Redis TTL Opreration", error);
    }
  }

  exists(key: string): Promise<Number> {
    try {
      return this.client.exists(key);
    } catch (error) {
      throw new BadRequestException("fail in Redis EXISTS Opreration", error);
    }
  }

  expire({ key, ttl }: { key: string; ttl: number }): Promise<Number> {
    try {
      return this.client.expire(key, ttl);
    } catch (error) {
      throw new BadRequestException("fail in Redis EXPIRE Opreration", error);
    }
  }

  keys(prefix: string = ""): Promise<string[]> {
    try {
      return this.client.keys(`${prefix}*`);
    } catch (error) {
      throw new BadRequestException("fail in Redis KEYS Opreration", error);
    }
  }

  del(keys: string | string[]): Promise<Number> {
    try {
      if (Array.isArray(keys)) {
        if (!keys.length) throw new BadRequestException("Please enter a valid keys");
      }

      return this.client.del(keys);
    } catch (error) {
      throw new BadRequestException("fail in Redis DEL Opreration", error);
    }
  }

  persist(key: string): Promise<Number> {
    try {
      return this.client.persist(key);
    } catch (error) {
      throw new BadRequestException("fail in Redis PERSIST Opreration", error);
    }
  }

  incr(key: string): Promise<Number> {
    try {
      return this.client.incr(key);
    } catch (error) {
      throw new BadRequestException("fail in Redis INCR Opreration", error);
    }
  }
}

export default new RedisService();
