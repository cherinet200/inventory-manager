import express from "express";
import dotenv from "dotenv";
import { signIn, signUp } from "./handler/users.ts";
import { Authentication } from "./module/auth.ts";
import router from "./router.ts";
import cookieParser from "cookie-parser";
import cors from "cors";
import { forgotPassword, changePassword } from "./handler/resetPassword.ts";
import resendWebhook from "./services/resendWebHook.ts";
import resendWebhookRouter from "./services/resendWebHook.ts";

dotenv.config();

const app = express();

app.use(
    "/webhooks/resend",
    express.raw({ type: "application/json" }),
    resendWebhook,
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    }),
);

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
