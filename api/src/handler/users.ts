import bcrypt from "bcrypt";
import prisma from "../db.ts";
import type { Request, Response } from "express";
import {
    checkPassword,
    createJwt,
    deleteRefreshToken,
    hashPassword,
} from "../module/auth.ts";

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
    const dbUser = await prisma.user.findUnique({
        where: {
            email: req.body.email,
        },
    });

    const DUMMY_HASH = await bcrypt.hash(process.env.DUMMY_PASSWORD!, 12);
    const hash = dbUser?.password ?? DUMMY_HASH;

    const correctPassword = await checkPassword(req.body.password, hash);

    if (!dbUser || !correctPassword) {
        console.log("dbUser", dbUser);
        console.log("correctPassword", correctPassword);
        return res
            .status(401)
            .json({ success: false, message: "Invalid credentials!" });
    }

    const token = createJwt(dbUser);

    res.cookie(
        "user",
        JSON.stringify({ name: dbUser.name, email: dbUser.email }),
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
        });
};

export const logOut = async (req: Request, res: Response) => {
    await deleteRefreshToken(req.user!.id);

    res.clearCookie("user")
        .clearCookie("accessToken", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        })
        .clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        });

    res.sendStatus(204);
};
