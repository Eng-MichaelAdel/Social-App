import { OAuth2Client } from "../../Client";
import envConfig from "../../../Config/env.config";
import { ForbiddenException, UnauthorizedException } from "../Error";
const envGcp = envConfig.GCP;

export const verifyGcpIdToken = async (idToken: string) => {
  const ticket = await OAuth2Client.verifyIdToken({
    idToken,
    audience: envGcp.Gcp_client_id,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new UnauthorizedException("Invalid gcp token");
  } else if (!payload.email_verified) {
    throw new ForbiddenException("Email not verified");
  }
  return payload;
};


