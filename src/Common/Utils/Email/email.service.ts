import { EventEmitter } from "node:events";
import { transporter } from "./email.client";
import Mail from "nodemailer/lib/mailer";
import { envConfig } from "../../../Config";
import { BadRequestException } from "../Error";

export const sendEmail = async ({ to, cc, subject, attachments = [], html }: Mail.Options): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"Social-aApp" <${envConfig.EMAIL.user}>`,
      to,
      cc,
      subject,
      attachments,
      html,
    });

    if (!to && !cc) {
      throw new BadRequestException("Invalid email recipient");
    }
    if (!(html as string).length && !attachments.length) {
      throw new BadRequestException("Invalid Email content");
    }
    console.log("Message sent 📤");
  } catch (err) {
    console.error("Error while sending mail:", err);
    throw err;
  }
};

export const emailEvent = new EventEmitter();
emailEvent.on("sendEmail", ({ to, cc, subject, attachments = [], html }: Mail.Options) => {
  console.log({ to, cc, subject });
  
  sendEmail({ to, cc, subject, html });
});
