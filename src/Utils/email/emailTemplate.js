// src/utils/email/emailTemplate.js
export const emailTemplate = ({ otp, subject }) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${subject}</title> <!-- FIX: الـ subject بيظهر هنا كعنوان للصفحة -->
    </head>
    <body style="margin:0; padding:0; background:#f4f4f7; font-family:Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
            <tr>
                <td align="center">
                    <table width="560" cellpadding="0" cellspacing="0"
                        style="background:#ffffff; border-radius:10px; overflow:hidden;">

                        <!-- Header -->
                        <tr>
                            <td align="center" style="background:#6c63ff; padding:24px;">
                                <h1 style="margin:0; color:#ffffff; font-size:22px;">Saraha App</h1>
                            </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                            <td style="padding:36px 32px 12px; color:#161616;">
                                <h2 style="margin:0 0 16px; font-size:20px;">${subject}</h2> <!-- FIX: الـ subject كعنوان داخل الإيميل -->
                                <p style="margin:0 0 24px; font-size:15px; line-height:1.6; color:#444444;">
                                    Use the verification code below to complete your request.
                                </p>
                            </td>
                        </tr>

                        <!-- OTP -->
                        <tr>
                            <td align="center" style="padding:0 32px 24px;">
                                <div style="display:inline-block; background:#f0efff; color:#6c63ff;
                                            font-size:32px; font-weight:bold; letter-spacing:8px;
                                            padding:14px 28px; border-radius:8px;">
                                    ${otp} <!-- FIX: الـ OTP بيتحط هنا -->
                                </div>
                            </td>
                        </tr>

                        <!-- Note -->
                        <tr>
                            <td style="padding:0 32px 36px; color:#6b7280; font-size:13px;">
                                <p style="margin:0 0 8px;">This code will expire in 10 minutes.</p>
                                <p style="margin:0;">If you didn't request this, you can safely ignore this email.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};