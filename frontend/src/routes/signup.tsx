import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import brandLogo from "../assets/inventory.png";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/signup")({
    component: Signup,
});

function Signup() {
    const [showMessage, setShowMessage] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShowWarning(false);
        const { name, value } = e.target as typeof e.target & {
            name: string;
            value: string;
        };
        setFormData((preData) => ({
            ...preData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();

        const res = await fetch("/auth/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...formData }),
        });
        const response = await res.json();

        if (response.success) {
            setShowMessage(true);

            window.location.href = "/signin";
        }

        if (response.message === "User already exists") {
            setShowWarning(true);
            setTimeout(() => {
                setShowWarning(false);
            }, 5000);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen gap-100 dark:bg-gray-950">
            {showMessage && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 rounded text-green-600 px-8 py-4 shadow-lg border border-green-600">
                    User created successfully! You can sign in now.
                </div>
            )}
            {showWarning && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 rounded text-red-600 px-8 py-4 shadow-lg border border-red-600">
                    User already exists!
                </div>
            )}
            <div className="w-[20%] h-full hidden justify-center items-center lg:flex">
                <img src={brandLogo} alt="Brand" />
            </div>
            <form
                className="h-full w-95 flex justify-center items-center flex-col gap-8"
                onSubmit={handleSubmit}
            >
                <div className="flex justify-center items-center flex-col gap-4">
                    <img src={brandLogo} alt="Brand" width="60" height="60" />
                    <h1 className="text-4xl font-semibold text-gray-900 dark:text-white">
                        Create an account
                    </h1>
                    <p className="text-lg text-gray-400">
                        Please enter your details to get started.
                    </p>
                </div>
                <div className="w-full flex justify-center items-center flex-col gap-2">
                    <div className="w-full">
                        <label
                            htmlFor="name"
                            className="self-start text-base text-gray-600 dark:text-gray-300 font-medium"
                        >
                            Name*
                        </label>
                        <input
                            type="name"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your name"
                            className="w-full p-2.5 border border-gray-600 rounded-md text-base"
                            required
                        />
                    </div>
                    <div className="w-full">
                        <label
                            htmlFor="email"
                            className="self-start text-base text-gray-600 dark:text-gray-300 font-medium"
                        >
                            Email*
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
                        />
                    </div>
                    <div className="w-full">
                        <label
                            htmlFor="password"
                            className="self-start text-base text-gray-600 dark:text-gray-300 font-medium"
                        >
                            Password*
                        </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-md text-base"
                            required
                        />
                    </div>
                    <p className="text-gray-400 self-start">
                        Must be at least 8 characters.
                    </p>
                </div>
                <div className="w-full flex justify-center items-center flex-col gap-5">
                    <button
                        type="submit"
                        className="text-lg text-white bg-blue-500 dark:bg-blue-600 font-normal cursor-pointer border-none rounded-md w-full p-2.5"
                    >
                        Get started
                    </button>
                    <div className="text-base text-gray-400 align-center">
                        Already have an account?{" "}
                        <Link
                            to="/signin"
                            className="text-base text-blue-500 self-end"
                        >
                            Sign in
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default Signup;
