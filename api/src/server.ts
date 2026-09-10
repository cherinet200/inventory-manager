import { signIn, signUp } from "./handler/users.js";
import express from "express";
import dotenv from "dotenv";
import { Authentication } from "./module/auth.js";
import router from "./router.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { forgotPassword, changePassword } from "./handler/resetPassword.js";
import resendWebhookRouter from "./services/resendWebHook.js";
import { handleCodeVerification } from "./handler/verification.js";
import prisma from "./db.js";

dotenv.config();

const app = express();

const allowedOrigins = ["http://localhost:5173"];

app.use(
    cors({
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
    }),
);

app.use(
    "/auth/webhooks/resend",
    express.raw({ type: "application/json" }),
    resendWebhookRouter,
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get("/backend", (req, res) => {
    res.json({ message: "Welcome to my inventory manager!" });
});

app.post("/auth/signup", signUp);
app.post("/auth/signin", signIn);

app.post("/auth/codeVerification", handleCodeVerification);
app.post("/auth/forgotPassword", forgotPassword);
app.post("/auth/changePassword", changePassword);

app.use("/api", Authentication, router);

export default app;
