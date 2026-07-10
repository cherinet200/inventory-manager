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
        return res.status(400).json({ message: "User already exists" });
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

    if (!user) {
        return res.status(400).json({ message: "User doesn't exist!" });
    }

    const correctPassword = checkPassword(req.body.password, user.password);

    if (!correctPassword) {
        return res.status(400).json({ message: "Incorect Password!" });
    }

    const token = createJwt(user);

    return res.json({ data: token });
};
