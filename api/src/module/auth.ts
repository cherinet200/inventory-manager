import bcrypt from "bcrypt";
import dotenv from "dotenv";
import prisma from "../db.ts";
import jwt from "jsonwebtoken";
import type { JwtPayload, SignOptions } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";

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
        jti: randomUUID(),
    };
    const accessToken = generateToken(payload, "15m");
    const refreshToken = generateToken(payload, "7d");
    saveRefreshToken(refreshToken, user.id);
    return { accessToken: accessToken, refreshToken: refreshToken };
};

export const tokenRefresher = async (req: Request, res: Response) => {
    const token = req.body.token;

    if (!token)
        return res.status(401).json({ message: "Refresh token is missing!" });

    try {
        const user = jwt.verify(
            token,
            process.env.REFRESH_SECRET!,
        ) as TokenPayload;

        const isValid = await prisma.refreshToken.findUnique({
            where: {
                token: token,
            },
        });

        if (!isValid)
            return res.status(401).json({ message: "Invalid token!" });

        const accessToken = generateToken({ id: user.id }, "15m");
        const refreshToken = generateToken(
            { id: user.id, jti: randomUUID() },
            "7d",
        );
        await saveRefreshToken(refreshToken, user.id);

        return res
            .status(200)
            .cookie("refToken", refreshToken, {
                // httpOnly: true,
                secure: true,
                // sameSite: "lax",
            })
            .cookie("token", accessToken, {
                httpOnly: false,
                secure: true,
                sameSite: "none",
            })
            .json({ accessToken });
    } catch (err) {
        return res.status(401).json({ message: "Invalid token!", error: err });
    }
};

const generateToken = (payload: object, expiry: SignOptions["expiresIn"]) => {
    return expiry === "15m"
        ? jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: expiry })
        : jwt.sign(payload, process.env.REFRESH_SECRET!, { expiresIn: expiry });
};

const saveRefreshToken = async (token: string, id: string) => {
    await prisma.refreshToken.deleteMany({
        where: {
            userId: id,
        },
    });
    await prisma.refreshToken.create({
        data: {
            token: token,
            userId: id,
        },
    });
};

export const Authentication = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res
            .status(401)
            .json({ message: "Authorization header is missing" });

    const token = authHeader.split(" ")[1];
    if (!token)
        return res.status(401).json({ message: "Bearer token is missing" });

    try {
        const claims = jwt.verify(token, process.env.JWT_SECRET!, {
            algorithms: ["HS256"],
        }) as JwtPayload & { id: string };
        req.user = { id: claims.id };

        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid or expired token!", err });
    }
};
