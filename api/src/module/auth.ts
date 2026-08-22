import bcrypt from "bcrypt";
import dotenv from "dotenv";
import prisma from "../db.ts";
import jwt from "jsonwebtoken";
import type { JwtPayload, SignOptions } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";
import { clearAuthCookies } from "../handler/users.ts";

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

const handleTokenRefresh = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const token = req.cookies.refreshToken;

    if (!token) {
        return clearAuthCookies(res);
    }
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

        if (isValid && !isValid.revokedAt) {
            const accessToken = generateToken({ id: user.id }, "15m");
            const refreshToken = generateToken(
                { id: user.id, jti: randomUUID() },
                "7d",
            );
            await saveRefreshToken(refreshToken, user.id, isValid?.id);

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
            }).cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
            });

            req.user = { id: user.id };

            return next();
        } else {
            return res.json({ shouldRefresh: true });
        }
    } catch (err) {
        return clearAuthCookies(res);
    }
};

const generateToken = (payload: object, expiry: SignOptions["expiresIn"]) => {
    return expiry === "15m"
        ? jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: expiry })
        : jwt.sign(payload, process.env.REFRESH_SECRET!, { expiresIn: expiry });
};

const saveRefreshToken = async (token: string, id: string, stored?: number) => {
    stored
        ? await prisma.$transaction([
              prisma.refreshToken.update({
                  where: {
                      id: stored,
                  },
                  data: {
                      revokedAt: new Date(),
                  },
              }),
              prisma.refreshToken.create({
                  data: {
                      token: token,
                      userId: id,
                      revokedAt: null,
                  },
              }),
          ])
        : await prisma.refreshToken.create({
              data: {
                  token: token,
                  userId: id,
                  revokedAt: null,
              },
          });
};

export const deleteRefreshToken = async (id: string) => {
    await prisma.refreshToken.deleteMany({
        where: {
            userId: id,
        },
    });
};

export const Authentication = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const token = req.cookies.accessToken;

    try {
        const claims = jwt.verify(token, process.env.JWT_SECRET!, {
            algorithms: ["HS256"],
        }) as JwtPayload & { id: string };
        req.user = { id: claims.id };

        next();
    } catch (err) {
        return handleTokenRefresh(req, res, next);
    }
};
