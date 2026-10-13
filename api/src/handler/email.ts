import { ReactNode } from "react";
import { render } from "react-email";
import { Resend } from "resend";
import prisma from "../db.js";
import nodemailer from "nodemailer";

interface SendMailOptions {
    to: string;
    subject: string;
    react: ReactNode;
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ?? 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendMail = async ({ to, subject, react }: SendMailOptions) => {
    const html = await render(react);

    transporter.sendMail({
        from: `"Inventory Manager" <${process.env.SMTP_FROM}`,
        to,
        subject,
        html,
    });
};

export default sendMail;
