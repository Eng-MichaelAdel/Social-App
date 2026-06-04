import { envConfig } from "../../Config";
import { compare, hash } from "bcrypt";
import crypto from "crypto";
import { BadRequestException } from "../Utils";

const encryptionEnv = envConfig.ENCRYPTION;
const hashEnv = envConfig.HASH;

class DataSecurityService {
  //*  hashing and comparing password
  generateHash(plainText: string): Promise<string> {
    return hash(plainText, hashEnv.SALT_ROUND);
  }
  
  async compareHash(password: string, hashedPassword: string): Promise<boolean> {
    let match = false;
    if (await compare(password, hashedPassword)) {
      match = true;
    }
  
    return match;
  }

  //* encryption and decryption
  encrypt(plainText: string): string {
    // generate a random initialization vector (IV) for each encryption
    const IV = crypto.randomBytes(encryptionEnv.IV_LENGTH);

    // create a cipher using the AES-256-CBC algorithm, the encryption key and the IV
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(encryptionEnv.ENCRYPTION_KEY, "hex"), IV);

    // encrypt the plain text
    let encryption = cipher.update(plainText, "utf-8", "hex");

    // finalize the encryption
    encryption += cipher.final("hex");

    return IV.toString("hex") + ":" + encryption;
  }

  decrypt(encryptedText: string): string {
    // split the IV and the encrypted text
    const [IV, Encryption] = encryptedText.split(":");

    // check if the IV and the encrypted text are present
    if (!IV || !Encryption) {
      throw new BadRequestException("Invalid encrypted text format", { "at IV or Encryption part": "missing" });
    }

    // convert the IV to a buffer
    const bufferdIV = Buffer.from(IV, "hex");

    // create a decipher using the same algorithm, key and IV
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(encryptionEnv.ENCRYPTION_KEY, "hex"), bufferdIV);

    // decrypt the encrypted text
    let decryption = decipher.update(Encryption, "hex", "utf-8");

    // finalize the decryption
    decryption += decipher.final("utf-8");

    return decryption;
  }
}

export default DataSecurityService;
