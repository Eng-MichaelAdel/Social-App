import nodemailer from "nodemailer";
import { emailConfig } from "./email.config";

// Create a transporter using SMTP
export const transporter = nodemailer.createTransport(emailConfig);
