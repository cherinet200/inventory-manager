import express from "express";
import dotenv from "dotenv";
import { signIn, signUp } from "./handler/users.ts";
import { Authentication, tokenRefresher } from "./module/auth.ts";
import router from "./router.ts";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/protected", (req, res) => {
    res.json({ message: "Welcome to my inventory manager!" });
});
app.post("/signup", signUp);
app.post("/signin", signIn);
app.post("/token", tokenRefresher);

app.use("/api", Authentication, router);

export default app;
