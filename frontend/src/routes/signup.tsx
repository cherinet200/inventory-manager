import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import brandLogo from "../assets/inventory.png";
import { Link } from "@tanstack/react-router";
import { Eye, EyeOff, Check } from "lucide-react";

export const Route = createFileRoute("/signup")({
    component: Signup,
});

function Signup() {
    const [showMessage, setShowMessage] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState(
        "User already exists!",
    );
    const [showPassword, setShowPassword] = useState(false);
    const [warningStyle, setWarningStyle] = useState({
        length: "",
        match: "",
        email: "",
        lmoving: false,
        mmoving: false,
        emoving: false,
    });
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        cPassword: "",
    });

    function isValidEmail(email: string): boolean {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setWarningMessage("");
        setShowWarning(false);
        setShowMessage(false);
        const { name, value } = e.target as typeof e.target & {
            name: string;
            value: string;
        };

        // Change the form data
        setFormData((preData) => ({
            ...preData,
            [name]: value,
        }));

        // Length
        name === "password"
            ? value.length >= 8
                ? setWarningStyle((prev) => ({
                      ...prev,
                      length: "text-green-500",
                      lmoving: false,
                  }))
                : setWarningStyle((prev) => ({
                      ...prev,
                      length: "text-gray-400",
                      lmoving: false,
                  }))
            : undefined;

        // Match
        name === "password"
            ? value === formData.cPassword &&
              value.length > 0 &&
              formData.cPassword.length > 0
                ? setWarningStyle((prev) => ({
                      ...prev,
                      match: "text-green-500",
                      mmoving: false,
                  }))
                : setWarningStyle((prev) => ({
                      ...prev,
                      match: "text-gray-400",
                      mmoving: false,
                  }))
            : value === formData.password &&
                value.length > 0 &&
                formData.password.length > 0
              ? setWarningStyle((prev) => ({
                    ...prev,
                    match: "text-green-500",
                    mmoving: false,
                }))
              : setWarningStyle((prev) => ({
                    ...prev,
                    match: "text-gray-400",
                    mmoving: false,
                }));

        // Valid email

        name === "email" && isValidEmail(value)
            ? setWarningStyle((prev) => ({
                  ...prev,
                  email: "text-green-500",
                  emoving: false,
              }))
            : setWarningStyle((prev) => ({
                  ...prev,
                  email: "text-gray-400",
                  emoving: false,
              }));
    };

    const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        const password = "c";
        const cpassword = "c";

        if (!isValidEmail(formData.email)) {
        }
        if (password === cpassword) {
            const res = await fetch("/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            });
            const response = await res.json();

            if (response.success) {
                setShowMessage(true);

                window.location.href = "/signin";
            }

            if (response.message === "User already exists") {
                setWarningMessage(response.message);
                setShowWarning(true);
                setTimeout(() => {
                    setShowWarning(false);
                }, 5000);
            }
        } else {
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
                    {warningMessage}
                </div>
            )}
            <div className="w-[20%] h-full hidden justify-center items-center lg:flex">
                <img src={brandLogo} alt="Brand" />
            </div>
            <form
                className="h-full w-97.5 flex justify-center items-center flex-col gap-8"
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
                    <div className="w-full">
                        <label
                            htmlFor="cpassword"
                            className="self-start text-base text-gray-600 dark:text-gray-300 font-medium"
                        >
                            Confirm Password*
                        </label>
                        <div className="relative flex items-center cursor-pointer">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="cPassword"
                                id="cPassword"
                                value={formData.cPassword}
                                onChange={handleChange}
                                placeholder="Confirms your password"
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
                    <div className="flex flex-col self-start p-2 pb-0">
                        <div
                            className={`text-gray-400 self-start flex items-center gap-1 ${warningStyle.email} ${warningStyle.emoving ? "animate-shake-right" : ""}`}
                            onAnimationEnd={() =>
                                setWarningStyle((prev) => ({
                                    ...prev,
                                    email: "text-gray-400",
                                    emoving: false,
                                }))
                            }
                        >
                            <div className="flex items-center justify-center">
                                <div className="flex items-center justify-center gap-1">
                                    <div className="flex items-center justify-center w-2.5 h-2.5 rounded-full border">
                                        {warningStyle.email ===
                                            "text-green-500" && (
                                            <Check className="w-3 h-3 stroke-3" />
                                        )}
                                    </div>
                                    Must be valid email.
                                </div>
                            </div>
                        </div>
                        <div
                            className={`text-gray-400 self-start flex items-center gap-1 ${warningStyle.length} ${warningStyle.lmoving ? "animate-shake-right" : ""}`}
                            onAnimationEnd={() =>
                                setWarningStyle((prev) => ({
                                    ...prev,
                                    length: "text-gray-400",
                                    lmoving: false,
                                }))
                            }
                        >
                            <div className="flex items-center justify-center gap-1">
                                <div className="flex items-center justify-center w-2.5 h-2.5 rounded-full border">
                                    {warningStyle.length ===
                                        "text-green-500" && (
                                        <Check className="w-3 h-3 stroke-3" />
                                    )}
                                </div>
                                Must be at least 8 characters.
                            </div>
                        </div>
                        <div
                            className={`text-gray-400 self-start flex items-center gap-1 ${warningStyle.match} ${warningStyle.mmoving ? "animate-shake-right" : ""}`}
                            onAnimationEnd={() =>
                                setWarningStyle((prev) => ({
                                    ...prev,
                                    match: "text-gray-400",
                                    mmoving: false,
                                }))
                            }
                        >
                            <div className="flex items-center justify-center">
                                <div className="flex items-center justify-center gap-1">
                                    <div className="flex items-center justify-center w-2.5 h-2.5 rounded-full border">
                                        {warningStyle.match ===
                                            "text-green-500" && (
                                            <Check className="w-3 h-3 stroke-3" />
                                        )}
                                    </div>
                                    Passwords must match.
                                </div>
                            </div>
                        </div>
                    </div>
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
