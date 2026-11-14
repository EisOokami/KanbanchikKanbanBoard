import dotenv from "dotenv";
import { emailTemplate } from "./emailTemplate.js";
import { transporter } from "./email.js";

dotenv.config({ quiet: true });

const escapeHtml = (value: string): string => {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
};

export const sendEmailChangeConfirmation = (
    name: string,
    newEmail: string,
    token: string,
): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        transporter.sendMail(
            {
                from: process.env.EMAIL_USER,
                to: newEmail,
                subject: "Confirm your new email address",
                html: emailTemplate({
                    logo: "cid:app-logo",
                    title: "Confirm your new email address",
                    heading: `Hi, ${escapeHtml(name)}!`,
                    description: `
                        You asked to use <strong>${escapeHtml(newEmail)}</strong> as the email address of your account.
                        Open the link below within 24 hours to confirm the change.
                    `,
                    buttonText: "Confirm email address",
                    buttonUrl: `${process.env.FRONTEND_URL}/confirmEmailChange?token=${token}`,
                    footer: "If you did not request this change, ignore this email. Your account keeps its current address.",
                }),
                attachments: [
                    {
                        filename: "logo.png",
                        path: "./assets/generallogo.png",
                        cid: "app-logo",
                    },
                ],
            },
            (error) => {
                if (error) {
                    reject(error);

                    return;
                }

                resolve();
            },
        );
    });
};

export const sendEmailChangeNotice = (
    name: string,
    currentEmail: string,
    newEmail: string,
    stage: "requested" | "completed",
): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        transporter.sendMail(
            {
                from: process.env.EMAIL_USER,
                to: currentEmail,
                subject:
                    stage === "requested"
                        ? "Email change requested for your account"
                        : "Your account email address was changed",
                html: emailTemplate({
                    logo: "cid:app-logo",
                    title: "Account email change",
                    heading: `Hi, ${escapeHtml(name)}!`,
                    description:
                        stage === "requested"
                            ? `A request was made to change the email address of your account to <strong>${escapeHtml(newEmail)}</strong>. The change takes effect only after it is confirmed from the new address.`
                            : `The email address of your account was changed to <strong>${escapeHtml(newEmail)}</strong>. This address is no longer used for your account.`,
                    footer: "If this wasn't you, change your password immediately and sign out all other sessions.",
                }),
                attachments: [
                    {
                        filename: "logo.png",
                        path: "./assets/generallogo.png",
                        cid: "app-logo",
                    },
                ],
            },
            (error) => {
                if (error) {
                    reject(error);

                    return;
                }

                resolve();
            },
        );
    });
};
