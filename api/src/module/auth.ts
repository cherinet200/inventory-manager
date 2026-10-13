import crypto from "crypto";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import prisma from "../db.js";
import jwt from "jsonwebtoken";
import type { JwtPayload, SignOptions } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { clearAuthCookies } from "../handler/users.js";

dotenv.config();

interface JWT {
    id: string;
}

interface AuthResult {
    accessToken: string;
    refreshToken: string;
    userId: string;
}

interface RecentRefresh {
    result: AuthResult;
    expiresAt: number;
}

const RECENT_REFRESH_T = 5_000;

const onGoingRefresh = new Map<string, Promise<AuthResult>>();
const recentRefresh = new Map<string, RecentRefresh>();

export const hashPassword = async (password: string) =>
    await bcrypt.hash(password, 10);

export const checkPassword = async (pass: string, hashedPass: string) =>
    await bcrypt.compare(pass, hashedPass);

export const createJwt = async (user: JWT) => {
    const payload = {
        id: user.id,
    };
    const accessToken = generateToken(payload, "15m");
    const refreshToken = generateToken(payload, "7d");
    const hashToken = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");
    await saveRefreshToken(hashToken, user.id);
    return { accessToken: accessToken, refreshToken: refreshToken };
};

const generateRefreshToken = () => {
    const rawToken = crypto.randomBytes(32).toString("hex");

    return rawToken;
};

const generateToken = (payload: object, expiry: SignOptions["expiresIn"]) => {
    return expiry === "15m"
        ? jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "15s" })
        : generateRefreshToken();
};

const saveRefreshToken = async (token: string, id: string, stored?: number) => {
    const refreshToken = token;
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
                      token: refreshToken,
                      userId: id,
                      revokedAt: null,
                      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
                  },
              }),
          ])
        : await prisma.refreshToken.create({
              data: {
                  token: refreshToken,
                  userId: id,
                  revokedAt: null,
                  expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
              },
          });
};

const performRefresh = async (refreshToken: string): Promise<AuthResult> => {
    const refreshTokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

    const refreshClaims = await prisma.refreshToken.findFirst({
        where: {
            token: refreshTokenHash,
            expiresAt: {
                gt: Date.now(),
            },
            revokedAt: null,
        },
    });

    if (!refreshClaims) {
        throw new Error("Invalid refresh token!");
    }

    const accessToken = generateToken({ id: refreshClaims.userId }, "15m");
    const newRefreshToken = generateToken({ id: refreshClaims.userId }, "7d");
    const hashToken = crypto
        .createHash("sha256")
        .update(newRefreshToken)
        .digest("hex");
    await saveRefreshToken(hashToken, refreshClaims.userId);

    return {
        accessToken,
        refreshToken: newRefreshToken,
        userId: refreshClaims.userId,
    };
};

const refreshForUser = (
    refreshToken: string,
    userId: string,
): Promise<AuthResult> => {
    const existingRefresh = onGoingRefresh.get(userId);

    if (existingRefresh) {
        return existingRefresh;
    }

    const refreshPromise = performRefresh(refreshToken)
        .then((result) => {
            recentRefresh.set(userId, {
                result,
                expiresAt: Date.now() + RECENT_REFRESH_T,
            });

            return result;
        })
        .finally(() => {
            onGoingRefresh.delete(userId);
        });

    onGoingRefresh.set(userId, refreshPromise);

    return refreshPromise;
};

const setAuthCookies = (
    res: Response,
    accessToken: string,
    refreshToken: string,
) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    });
};

export const Authentication = async (
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
        const refreshToken = req.cookies.refreshToken;
        const refreshTokenHash = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");

        if (err instanceof jwt.TokenExpiredError) {
            const refreshClaims = await prisma.refreshToken.findFirst({
                where: {
                    token: refreshTokenHash,
                },
            });

            console.log("Refresh claims: ", refreshClaims);

            if (!refreshClaims || !refreshClaims?.userId) {
                return clearAuthCookies(res);
            }

            const userId = refreshClaims.userId;

            const recent = recentRefresh.get(userId);

            let result: AuthResult;

            if (recent && recent.expiresAt > Date.now()) {
                result = recent.result;
            } else {
                recentRefresh.delete(userId);
                try {
                    result = await refreshForUser(refreshToken, userId);
                } catch (err) {
                    return clearAuthCookies(res);
                }
            }

            setAuthCookies(res, result.accessToken, result.refreshToken);

            req.user = { id: result.userId };

            return next();
        } else {
            if (req.cookies.refreshToken) {
            } else {
                return clearAuthCookies(res);
            }
        }
    }
};

export const deleteRefreshToken = async (id: string) => {
    await prisma.refreshToken.deleteMany({
        where: {
            userId: id,
        },
    });
};
