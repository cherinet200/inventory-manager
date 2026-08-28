import type { Request, Response } from "express";
import crypto from "crypto";
import prisma from "../db.ts";
import sendMail from "./email.ts";
import { hashPassword } from "../module/auth.ts";

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

    if (!account)
        return res.status(400).json({ message: "Couldn't sent you an email!" });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordUrl = `http://localhost:5173/reset-password?token=${rawToken}`;

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
        await sendMail(
            email,
            "Reset password",
            `<h1>Reset your password</h1><p>${resetPasswordUrl}</p>`,
        );
    } catch (error) {
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
