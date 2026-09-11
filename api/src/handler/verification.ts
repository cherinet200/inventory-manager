import prisma from "../db.js";
import sendMail from "./email.js";
import crypto from "crypto";
import verificationEmail from "../emails/verificationEmail.js";
import { Request, Response } from "express";
import { createUser, signInFunction } from "./users.js";
import { hashPassword } from "../module/auth.js";

interface VerificationInterface {
    name: string;
    email: string;
    password: string;
}

export const sendVerificationEmail = async ({
    name,
    email,
    password,
}: VerificationInterface) => {
    if (typeof email !== "string")
        return { success: false, message: "Email is missing!" };

    const verificationNumber = crypto.randomInt(100000, 1000000);

    const verificationCodeHash = crypto
        .createHash("sha256")
        .update(verificationNumber.toString())
        .digest("hex");

    const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const pendingUser = await prisma.pendingSignUp.upsert({
        where: {
            email,
        },
        update: {
            name,
            password: await hashPassword(password),
            verificationCodeHash,
            verificationCodeExpiresAt,
            verificationAttempts: {
                increment: 1,
            },
        },
        create: {
            name,
            email,
            password: await hashPassword(password),
            verificationCodeHash,
            verificationCodeExpiresAt,
        },
    });

    await sendMail({
        to: email,
        subject: "Sign up request",
        react: verificationEmail({
            verificationNumber,
        }),
    });

    return {
        success: true,
        id: pendingUser.id,
        message: "Sent you a verification code!",
    };
};

export const handleCodeVerification = async (req: Request, res: Response) => {
    if (!req.body)
        return res.status(400).json({ message: "Request body is missing!" });

    const id = req.body.id;

    if (typeof id !== "string")
        return res.status(400).json({ message: "Sign up id is missing!" });

    if (typeof req.body.code !== "number")
        return res
            .status(400)
            .json({ message: "Verification code is missing!" });

    const verificationCodeHash = crypto
        .createHash("sha256")
        .update(req.body.code.toString())
        .digest("hex");

    const pendingSignup = await prisma.pendingSignUp.findUnique({
        where: {
            id,
            verificationCodeHash,
            verificationCodeUsedAt: null,
            verificationCodeExpiresAt: {
                gt: new Date(),
            },
            verificationAttempts: {
                lt: 10,
            },
        },
    });

    if (!pendingSignup)
        return res.status(400).json({ message: "Invalid verification code!" });

    const newUser = await createUser({
        name: pendingSignup.name,
        email: pendingSignup.email,
        password: pendingSignup.password,
        hashed: true,
    });

    const { dbUser, token, error } = await signInFunction({
        email: newUser.email,
        password: newUser.password,
        hashed: true,
    });

    if (error || !dbUser || !token) {
        return res.status(401).json({ success: false, message: error });
    }

    res.cookie(
        "user",
        JSON.stringify({ name: dbUser.name, email: dbUser.email }),
        {
            maxAge: 100 * 365.25 * 24 * 60 * 60 * 1000,
        },
    )
        .cookie("refreshToken", token.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .cookie("accessToken", token.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
        })
        .json({
            success: true,
            message: "User created successfully! Enjoy our Services!",
        });
};
