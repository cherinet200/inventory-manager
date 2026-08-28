import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendMail = async (to: string, subject: string, html: string) => {
    const { data, error } = await resend.emails.send({
        from: `"Inventory Manager" <${process.env.EMAIL_FROM}>`,
        to: [to],
        subject: subject,
        html: html,
    });

    if (error) {
        console.log(error);
        throw error;
    }

    return data;
};

export default sendMail;
