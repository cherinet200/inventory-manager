import { ReactNode } from "react";
import { Resend } from "resend";
import prisma from "../db.js";

interface SendMailOptions {
    to: string;
    subject: string;
    react: ReactNode;
}

const resend = new Resend(process.env.RESEND_API_KEY);

const sendMail = async ({ to, subject, react }: SendMailOptions) => {
    const { data, error } = await resend.emails.send({
        from: `"Inventory Manager" <${process.env.EMAIL_FROM}>`,
        to: [to],
        subject,
        react,
    });

    if (error) {
        console.log(error);
        throw error;
    }

    await prisma.email.create({
        data: {
            resendId: data.id,
            recipient: to,
            subject: subject,
            status: "sent",
        },
    });

    return data;
};

export default sendMail;
