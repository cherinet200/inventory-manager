import prisma from "../db.js";
import sendMail from "./email.js";
import crypto from "crypto";
import verificationEmail from "../emails/verificationEmail.js";
import { Request, Response } from "express";
import { createUser } from "./users.js";

export const sendVerificationEmail = async (req: Request, res: Response) => {
    const body = req.body;
    if (!body)
        return res.status(400).json({ message: "Request body is missing!" });

    if (typeof body.email !== "string")
        return res.status(400).json({ message: "Email is missing!" });

    const verificationNumber = crypto.randomInt(100000, 1000000);

    const hashNumber = crypto
        .createHash("sha256")
        .update(verificationNumber.toString())
        .digest("hex");

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.verificationNumber.create({
        data: {
            numberHash: hashNumber,
            expiresAt,
            user: body.email,
        },
    });

    await sendMail({
        to: body.email,
        subject: "Sign up request",
        react: verificationEmail({
            verificationNumber,
        }),
    });
};

export const handleCodeVerification = async (req: Request, res: Response) => {
    const body = req.body;
    const { name, email, password } = body;
    if (!body)
        return res.status(400).json({ message: "Request body is missing!" });

    if (typeof body.code !== "number")
        return res
            .status(400)
            .json({ message: "Verification code is missing!" });

    const requestCode = body.code;
    const storedCode = await prisma.verificationNumber.findUnique({
        where: {
            numberHash: requestCode,
            usedAt: null,
            expiresAt: {
                gt: new Date(),
            },
        },
    });

    if (!storedCode)
        return res.status(400).json({ message: "Invalid verification code!" });

    const message = await createUser({ name, email, password });

    res.status(201).json(message);
};
