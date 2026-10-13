import bcrypt from "bcrypt";
import prisma from "../db.js";
import type { Request, Response } from "express";
import {
    checkPassword,
    createJwt,
    deleteRefreshToken,
    hashPassword,
} from "../module/auth.js";
import sendMail from "./email.js";
import newLogin from "../emails/newLogin.js";
import { sendVerificationEmail } from "./verification.js";

type DbUser = {
    id: string;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
};

type Token = {
    accessToken: string;
    refreshToken: string;
};

function isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

export const signUp = async (req: Request, res: Response) => {
    if (!req.body)
        return res.status(400).json({ message: "Request body is missing!" });

    const { name, password } = req.body;
    const email = req.body.email.trim().toLowerCase();

    if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string"
    )
        return res.status(400).json({
            message: "Invalid inputs!",
            description: "Input must contain username, email and password!",
        });

    if (!isValidEmail(email)) {
        return res.status(400).json({
            message: "Invalid email!",
            description: "Please provide a valid email!",
        });
    }

    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (user) {
        return res
            .status(400)
            .json({ success: false, message: "User already exists" });
    }

    if (!user) {
        let response;

        try {
            response = await sendVerificationEmail({
                name,
                email,
                password,
            });
        } catch (error) {
            console.log(error);

            return res.status(500).json({
                success: false,
                message: "Error sending verification email",
            });
        }
        return res.json(response);
    }
};

export const createUser = async ({
    name,
    email,
    password,
    hashed,
}: {
    name: string;
    email: string;
    password: string;
    hashed?: boolean;
}) => {
    let hashedPassword: string;

    if (!hashed) {
        hashedPassword = await hashPassword(password);
    } else {
        hashedPassword = password;
    }

    const newUser = await prisma.user.create({
        data: {
            name: name,
            email: email,
            password: hashedPassword,
        },
    });

    sendMail({
        to: process.env.ADMIN_EMAIL!,
        subject: "New User",
        react: newLogin(newUser),
    });

    return newUser;
};

export const signInFunction = async ({
    email,
    password,
    hashed,
}: {
    email: string;
    password: string;
    hashed?: boolean;
}): Promise<{
    dbUser: DbUser | null;
    token: Token | null;
    error?: string;
}> => {
    const dbUser = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    const DUMMY_HASH = await bcrypt.hash(process.env.DUMMY_PASSWORD!, 12);
    const hash = dbUser?.password ?? DUMMY_HASH;

    let correctPassword;

    if (!hashed) correctPassword = await checkPassword(password, hash);
    else if (hashed) correctPassword = hash === password;

    if (!dbUser || !correctPassword) {
        return { dbUser: null, token: null, error: "Invalid credentials!" };
    }

    const token = await createJwt(dbUser);

    return { dbUser, token };
};

export const signIn = async (req: Request, res: Response) => {
    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password;

    const { dbUser, token, error } = await signInFunction({ email, password });

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
        });
};

export const clearAuthCookies = (res: Response) => {
    res.clearCookie("user", {
        maxAge: 100 * 365.25 * 24 * 60 * 60 * 1000,
    })
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
    res.json({ success: true, message: "Logged out successfully!" });
};

export const logOut = async (req: Request, res: Response) => {
    await deleteRefreshToken(req.user!.id);

    return clearAuthCookies(res);
};
