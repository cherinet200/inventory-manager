import express from "express";
import dotenv from "dotenv";
import { signIn, signUp } from "./handler/users.ts";
import { Authentication, tokenRefresher } from "./module/auth.ts";
import router from "./router.ts";
import cors from "cors";

dotenv.config();

const app = express();

app.use(express.json());
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
app.post("/token", tokenRefresher);

app.use("/api", Authentication, router);

export default app;
