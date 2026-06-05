import { ITemplateData } from "./email.types";


export const otpTemplate = (data: ITemplateData): string => {
  return `
    <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Your OTP Code</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background: #f4f4f4;">
            <div style="max-width: 450px; margin: 50px auto; background: white; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                
                <div style="background: #4f46e5; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 22px;">🔐 ${data.title}</h1>
                </div>
                
                <div style="padding: 40px; text-align: center;">
                    <p style="color: #555; font-size: 16px;">Your OTP code is:</p>
                    
                    <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h1 style="color: #4f46e5; font-size: 48px; letter-spacing: 10px; margin: 0;">${data.otp}</h1>
                    </div>
                    
                    <p style="color: #999; font-size: 12px; margin-top: 30px;">Valid for ${data.expInMin} minutes</p>
                </div>
                
                <div style="background: #fafafa; padding: 15px; text-align: center; font-size: 12px; color: #999; border-radius: 0 0 10px 10px;">
                    MyApp - Secure Authentication
                </div>
                
            </div>
        </body>
        </html>
    `;
};
