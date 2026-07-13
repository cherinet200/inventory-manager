import bcrypt from "bcrypt";
import dotenv from "dotenv";
import prisma from "../db.ts";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";

dotenv.config();

interface TokenPayload {
    id: string;
}
interface jwt {
    id: string;
}

export const hashPassword = async (password: string) =>
    await bcrypt.hash(password, 10);

export const checkPassword = async (pass: string, hashedPass: string) =>
    await bcrypt.compare(pass, hashedPass);

export const createJwt = (user: jwt) => {
    const payload = {
        id: user.id,
    };
    const accessToken = generateToken(payload, "15s");
    const refreshToken = generateToken(payload, "7d");
    saveRefreshToken(refreshToken, user.id);
    return { accessToken: accessToken, refreshToken: refreshToken };
};

export const tokenRefresher = (req: Request, res: Response) => {
    const token = req.body.token;

    if (!token)
        return res.status(400).json({ message: "Refresh token is missing!" });

    try {
        const user = jwt.verify(
            token,
            process.env.REFRESH_SECRET!,
        ) as TokenPayload;

        const isValid = prisma.refreshToken.findUnique({
            where: {
                token: token,
            },
        });

        if (!isValid)
            return res.status(401).json({ message: "Invalid token!" });

        const accessToken = generateToken({ id: user.id }, "15s");
        const refreshToken = generateToken({ id: user.id }, "7d");
        saveRefreshToken(refreshToken, user.id);

        return res.status(200).json({ accessToken, refreshToken });
    } catch (err) {
        return res.status(401).json({ message: "Invalid token!", error: err });
    }
};

const generateToken = (payload: object, expiry: SignOptions["expiresIn"]) => {
    return expiry === "15s"
        ? jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: expiry })
        : jwt.sign(payload, process.env.REFRESH_SECRET!, { expiresIn: expiry });
};

const saveRefreshToken = async (token: string, id: string) => {
    await prisma.refreshToken.deleteMany();
    await prisma.refreshToken.create({
        data: {
            token: token,
            userId: id,
        },
    });
};
