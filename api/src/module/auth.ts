import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

interface jwt {
    id: string;
    name: string;
    email: string;
}

export const hashPassword = async (password: string) =>
    await bcrypt.hash(password, 10);

export const checkPassword = async (pass: string, hashedPass: string) =>
    await bcrypt.compare(pass, hashedPass);

export const createJwt = (user: jwt) => {
    const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
    };
    const secret_key = process.env.JWT_SECRET;
    const token = jwt.sign(payload, secret_key!, { expiresIn: "7d" });

    return token;
};
