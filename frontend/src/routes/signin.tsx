import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import Logo from "../assets/inventory.png";
import { Eye, EyeOff } from "lucide-react";
import Dots from "../components/loadingDots";
import Cookies from "js-cookie";

export const Route = createFileRoute("/signin")({
    component: Signin,
});

function Signin() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [showMessage, setShowMessage] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShowWarning(false);
        const { name, value } = e.target as typeof e.target & {
            name: string;
            value: string;
        };
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
        setIsLoading(true);
        e.preventDefault();

        const res = await fetch("/auth/signin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                ...formData,
            }),
        });
        const response = await res.json();

        if (!response.success) setShowWarning(true);
        if (response.success) {
            setShowMessage(true);
            const path = Cookies.get("tryingTo") ?? "/dashboard";
            window.location.href = path;
            Cookies.remove("tryingTo");
        }
        setIsLoading(false);
    };

    return (
        <div className="flex justify-center items-center h-screen gap-100 dark:bg-gray-950">
            <div className="w-[20%] h-full hidden justify-center items-center lg:flex">
                <img src={Logo} alt="Brand" />
            </div>
            <form
                className="h-full w-97.5 flex justify-center items-center flex-col gap-8"
                onSubmit={handleSubmit}
            >
                <div className="flex justify-center items-center flex-col gap-4">
                    <img src={Logo} alt="Brand" width="60" height="60" />
                    <h1 className="text-4xl font-semibold text-gray-900 dark:text-white">
                        Log in to your account
                    </h1>
                    <p className="text-lg text-gray-400">
                        Welcome back! Please enter your details.
                    </p>
                </div>
                <div className="w-full flex justify-center items-center flex-col gap-2">
                    <div className="w-full flex flex-col">
                        <label
                            htmlFor="email"
                            className="self-start text-base text-gray-600 dark:text-gray-300 font-medium"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            className="w-full p-2.5 border border-gray-600 rounded-md text-base"
                            required
                            autoFocus
                        />
                    </div>
                    <div className="w-full">
                        <label
                            htmlFor="password"
                            className="self-start text-base text-gray-600 dark:text-gray-300 font-medium"
                        >
                            Password
                        </label>
                        <div className="relative flex items-center cursor-pointer">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                id="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-md text-base"
                                required
                            />
                            <div
                                className="absolute right-2 text-gray-600 dark:text-gray-400"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff /> : <Eye />}
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="text-base text-blue-500 font-medium self-end decoration-none cursor-pointer"
                        onClick={() => {
                            Cookies.set("Email", formData.email);
                            window.location.href = "/forgot-password";
                        }}
                    >
                        Forgot password
                    </button>
                </div>
                <div className="w-full flex justify-center items-center flex-col gap-5">
                    <button
                        type="submit"
                        className="text-lg flex justify-center items-center gap-3 text-white bg-blue-500 dark:bg-blue-600 font-normal cursor-pointer border-none rounded-md w-full p-2.5"
                        disabled={isLoading}
                    >
                        {isLoading ? "Signing in" : "Sign in"}
                        {<Dots isLoading={isLoading} />}
                    </button>
                    <div className="text-base text-gray-400 align-center">
                        Don't have an account?{" "}
                        <a
                            href="/signup"
                            className="text-base text-blue-500 self-end"
                        >
                            Sign up
                        </a>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default Signin;
