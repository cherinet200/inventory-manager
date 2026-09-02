import { Router, type Request, type Response } from "express";
import { Resend } from "resend";
import prisma from "../db.ts";

const resendWebhookRouter = Router();

const resend = new Resend(process.env.RESEND_API_KEY);

resendWebhookRouter.post("/", async (req: Request, res: Response) => {
    try {
        const payload = req.body.toString();

        const event = resend.webhooks.verify({
            payload,
            headers: {
                id: req.headers["svix-id"] as string,
                timestamp: req.headers["svix-timestamp"] as string,
                signature: req.headers["svix-signature"] as string,
            },
            webhookSecret: process.env.RESEND_WEBHOOK_SECRET!,
        });

        if (event.type === "email.delivered") {
            await prisma.email.update({
                where: {
                    resendId: event.data.email_id,
                },
                data: {
                    status: "delivered",
                    event: event.type,
                },
            });
        }

        if (event.type === "email.bounced") {
            await prisma.email.update({
                where: {
                    resendId: event.data.email_id,
                },
                data: {
                    status: "bounced",
                    event: event.type,
                },
            });
        }

        if (event.type === "email.delivery_delayed") {
            await prisma.email.update({
                where: {
                    resendId: event.data.email_id,
                },
                data: {
                    status: "delivery_delayed",
                    event: event.type,
                },
            });
        }

        if (event.type === "email.failed") {
            await prisma.email.update({
                where: {
                    resendId: event.data.email_id,
                },
                data: {
                    status: "failed",
                    event: event.type,
                },
            });
        }

        console.log("==================== RESEND WEBHOOK ====================");
        console.log(JSON.parse(req.body));
        console.log("========================================================");

        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(400);
    }
});

export default resendWebhookRouter;
