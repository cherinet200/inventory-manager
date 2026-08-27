import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

const sendMail = async (to: string, subject: string, html: string) => {
    try {
        const info = await transporter.sendMail({
            from: `"Inventory Manager" <${process.env.SMTP_FROM}>`,
            to,
            subject,
            html,
        });

        return info;
    } catch (error) {
        console.error("Email failed:", error);
    }
};

export default sendMail;
