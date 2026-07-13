import express from "express";
import dotenv from "dotenv";
import { signIn, signUp } from "./handler/users.ts";
import { tokenRefresher } from "./module/auth.ts";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.json({ message: "Welcome to my inventory manager!" });
});
app.post("/signup", signUp);
app.post("/signin", signIn);
app.post("/token", tokenRefresher);

export default app;
