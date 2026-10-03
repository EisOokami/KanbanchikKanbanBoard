import { emailTemplate } from "./emailTemplate.js";
import dotenv from "dotenv";
import { transporter } from "./email.js";
import type { User } from "../types/types.js";

dotenv.config();

export const sendLoginCodeEmail = async (
    user: Pick<User, "id" | "name" | "email">,
    code: string,
): Promise<void> => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `${code} - your login code`,
        html: emailTemplate({
            logo: "cid:app-logo",
            title: "Login code",
            heading: `Hi, ${user.name}!`,
            description: `
                    Your verification code is:
                    <br />
                    <p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p>
                    It expires in 10 minutes.
                `,
            footer: "If this wasn't you, please change your password immediately and contact support.",
        }),
        attachments: [
            {
                filename: "logo.png",
                path: "./assets/generallogo.png",
                cid: "app-logo",
            },
        ],
    };

    await new Promise<void>((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(error);
                return;
            }

            console.log(`Code notification email sent: ${info.response}`);
            resolve();
        });
    });
};
