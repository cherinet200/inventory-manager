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

let onGoingRefreshMap: Promise<void | Response<
    any,
    Record<string, any>
>> | null = null;

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
    await saveRefreshToken(refreshToken, user.id);
    return { accessToken: accessToken, refreshToken: refreshToken };
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

const performRefresh = async (refreshToken: string): Promise<AuthResult> => {
    const refreshClaims = jwt.verify(
        refreshToken,
        process.env.REFRESH_SECRET!,
        {
            algorithms: ["HS256"],
        },
    ) as JwtPayload & { id: string };

    const storedToken = await prisma.refreshToken.findFirst({
        where: {
            token: refreshToken,
            userId: refreshClaims.id,
            revokedAt: null,
        },
    });

    if (!refreshClaims.id || !storedToken) {
        throw new Error("Invalid refresh token!");
    }

    const accessToken = generateToken({ id: refreshClaims.id }, "15m");
    const newRefreshToken = generateToken({ id: refreshClaims.id }, "7d");
    await saveRefreshToken(newRefreshToken, refreshClaims.id, storedToken.id);

    return {
        accessToken,
        refreshToken: newRefreshToken,
        userId: refreshClaims.id,
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

        if (err instanceof jwt.TokenExpiredError) {
            const refreshClaims = jwt.verify(
                refreshToken,
                process.env.REFRESH_SECRET!,
                {
                    algorithms: ["HS256"],
                },
            ) as JwtPayload & { id: string };

            if (!refreshClaims.id) {
                return clearAuthCookies(res);
            }

            const userId = refreshClaims.id;

            const recent = recentRefresh.get(userId);

            let result: AuthResult;

            if (recent && recent.expiresAt > Date.now()) {
                result = recent.result;
            } else {
                recentRefresh.delete(userId);

                result = await refreshForUser(refreshToken, userId);
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
