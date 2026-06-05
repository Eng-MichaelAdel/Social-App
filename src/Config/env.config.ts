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

  JWT: {
    user: {
      accessSignature: process.env.USER_JWT_ACCESS_SECRET ?? "jwt_user_access_secret@social-app-06042026T11:50",
      accessExp: parseInt(process.env.USER_JWT_ACCESS_EXP as string) ?? 3600,
      refreshSignature: process.env.USER_JWT_REFRESH_SECRET ?? "jwt_user_refresh_secret@social-app-06042026T11:50",
      refreshExp: parseInt(process.env.USER_JWT_REFRESH_EXP as string) ?? 604800,
    },
    admin: {
      accessSignature: process.env.ADMIN_JWT_ACCESS_SECRET ?? "jwt_admin_access_secret@social-app-06042026T11:50",
      accessExp: parseInt(process.env.ADMIN_JWT_ACCESS_EXP as string) ?? 3600,
      refreshSignature: process.env.ADMIN_JWT_REFRESH_SECRET ?? "jwt_admin_refresh_secret@social-app-06042026T11:50",
      refreshExp: parseInt(process.env.ADMIN_JWT_REFRESH_EXP as string) ?? 604800,
    },
  },

  EMAIL: {
    user: process.env.EMAIL_USER ?? "michael.civil13@gmail.com",
    password: process.env.EMAIL_PASS ?? "weypgegrxbefrclp",
    service: process.env.EMAIL_SERVICE ?? "Gmail",
  },
};

export default envConfig;
