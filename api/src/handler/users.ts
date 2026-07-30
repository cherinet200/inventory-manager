import bcrypt from "bcrypt";
import prisma from "../db.ts";
import type { Request, Response } from "express";
import { checkPassword, createJwt, hashPassword } from "../module/auth.ts";

export const signUp = async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
        where: {
            email: req.body.email,
        },
    });

    if (user) {
        return res
            .status(400)
            .json({ success: false, message: "User already exists" });
    }

    if (!user) {
        await prisma.user.create({
            data: {
                name: req.body.name,
                email: req.body.email,
                password: await hashPassword(req.body.password),
            },
        });

        return res.status(201).json({
            success: true,
            message: "User created successfully! Enjoy our services.",
        });
    }
};

export const signIn = async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
        where: {
            email: req.body.email,
        },
    });

    const DUMMY_HASH = await bcrypt.hash(process.env.DUMMY_PASSWORD!, 12);
    const hash = user?.password ?? DUMMY_HASH;

    const correctPassword = await checkPassword(req.body.password, hash);

    if (!user || !correctPassword) {
        return res
            .status(401)
            .json({ success: false, message: "Invalid credentials!" });
    }

    const token = createJwt(user);

    return res
        .cookie("refresh_token", token.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/token",
        })
        .json({
            success: true,
            id: user.id,
            user: {
                email: user.email,
                name: user.name,
            },
            accessToken: token.accessToken,
        });
};
