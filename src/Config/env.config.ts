import { config } from "dotenv";

config({ path: [`.env.${process.env.NODE_ENV}`, ".env"] });

const envConfig = {
  app: {
    PORT: process.env.PORT ?? 3000,
    NODE_ENV: process.env.NODE_ENV,
  },
  DB: {
    URI: process.env.URI ?? "mongodb+srv://MaicoAdel:2i7O-21189@cluster0.7hpjxwj.mongodb.net/Social_App",
  },
  ENCRYPTION: {
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY ?? "fe4a85206839d2cb3145265b50cf75d7beb21a37caeca4abc6c64de5432b754a",
    IV_LENGTH: parseInt(process.env.IV_LENGTH as string) ?? 16,
  },
  HASH: {
    SALT_ROUND: parseInt(process.env.SALT_ROUND as string) ?? 12,
  },
};

export default envConfig;
