import express from "express";
import dotenv from "dotenv";
import { signIn, signUp } from "./handler/users.ts";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.json({ message: "Bello!" });
});
app.post("/signup", signUp);
app.post("/signin", signIn);

export default app;
