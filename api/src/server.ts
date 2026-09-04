import express from "express";
import dotenv from "dotenv";
import { signIn, signUp } from "./handler/users.js";
import { Authentication } from "./module/auth.js";
import router from "./router.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { forgotPassword, changePassword } from "./handler/resetPassword.js";
import resendWebhook from "./services/resendWebHook.js";
import resendWebhookRouter from "./services/resendWebHook.js";

dotenv.config();

const app = express();

const allowedOrigins = [
    "https://inventory-manager-omega-two.vercel.app",
    "http://localhost:5173",
];

app.use(
    cors({
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
    }),
);

app.use(
    "/webhooks/resend",
    express.raw({ type: "application/json" }),
    resendWebhook,
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.json({ message: "Welcome to my inventory manager!" });
});

app.post("/signup", signUp);
app.post("/signin", signIn);

app.post("/forgotPassword", forgotPassword);
app.post("/changePassword", changePassword);

app.use("/api", Authentication, router);

app.use(
    "/webhooks/resend",
    express.raw({ type: "application/json" }),
    resendWebhookRouter,
);

export default app;
