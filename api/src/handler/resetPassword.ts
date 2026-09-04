import type { Request, Response } from "express";
import crypto from "crypto";
import prisma from "../db.js";
import sendMail from "./email.js";
import { hashPassword } from "../module/auth.js";
import resetPasswordEmail from "../emails/resetPasswordEmail.js";

export const forgotPassword = async (req: Request, res: Response) => {
    if (!req.body)
        return res
            .status(400)
            .json({ message: "You must enter your email address" });
    const { email } = req.body;
    if (!email)
        return res
            .status(400)
            .json({ message: "You must enter your email address" });

    const account = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    const requestsBefore = await prisma.email.count({
        where: {
            recipient: email,
        },
    });

    console.log(requestsBefore);

    if (!account)
        return res.status(400).json({ message: "Couldn't sent you an email!" });

    if (requestsBefore > 10)
        return res
            .status(429)
            .json({ message: "Reset password request limit reached!" });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;

    const hashToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.passwordResetToken.create({
        data: {
            tokenHash: hashToken,
            expiresAt: expiresAt,
            userId: account.id,
        },
    });

    try {
        await sendMail({
            to: email,
            subject: "Reset password",
            react: resetPasswordEmail({
                resetPasswordUrl,
            }),
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Couldn't sent you an email" });
    }

    res.status(200).json({ message: "Sent you an email" });
};

export const changePassword = async (req: Request, res: Response) => {
    if (!req.body)
        return res
            .status(400)
            .json({ message: "You must provide the new password" });
    const { password, token } = req.body;
    if (!password || !token) {
        return res
            .status(400)
            .json({ message: "You must provide the password and the token" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const resetToken = await prisma.passwordResetToken.findUnique({
        where: {
            tokenHash,
            usedAt: null,
            expiresAt: {
                gt: new Date(),
            },
        },
    });

    if (!resetToken)
        return res.status(400).json({ message: "Invalid reset link" });

    await prisma.$transaction([
        prisma.user.update({
            where: {
                id: resetToken.userId,
            },
            data: {
                password: await hashPassword(password),
            },
        }),

        prisma.passwordResetToken.update({
            where: {
                id: resetToken.id,
            },
            data: {
                usedAt: new Date(),
            },
        }),
    ]);

    return res.json({ message: "Password changed successfully!" });
};
