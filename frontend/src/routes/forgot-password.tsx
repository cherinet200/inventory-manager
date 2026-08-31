import { createFileRoute } from "@tanstack/react-router";
import Logo from "../assets/inventory.png";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
    component: RouteComponent,
});

function RouteComponent() {
    const [message, setMessage] = useState("");
    const [wMessage, setWMessage] = useState("");
    const [sent, setSent] = useState<boolean>(false);
    const [seconds, setSeconds] = useState<number>(30);
    const [showMessage, setShowMessage] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [email, setEmail] = useState("");
    const [warningStyle, setWarningStyle] = useState({
        email: "",
        emoving: false,
    });

    function isValidEmail(email: string): boolean {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage("");
        setWMessage("");
        setShowWarning(false);
        setShowMessage(false);
        const { value } = e.target as typeof e.target & {
            value: string;
        };
        setEmail(value);
        isValidEmail(email)
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

    const handleForgotPassword = async (
        e: React.ChangeEvent<HTMLFormElement>,
    ) => {
        e.preventDefault();

        if (!isValidEmail(email)) {
            setWMessage("Invalid email!");
            setWarningStyle((prev) => ({
                ...prev,
                email: "text-red-600",
                emoving: true,
            }));
            return setShowWarning(true);
        }

        setMessage("");
        setWMessage("");
        setShowWarning(false);
        setShowMessage(false);

        const res = await fetch("/auth/forgotPassword", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
            }),
        });
        const data = await res.json();

        if (res.status === 200) {
            setMessage(data.message);
            setShowMessage(true);
        } else {
            setWMessage(data.message);
            setShowWarning(true);
        }

        setTimeout(() => {
            setSent(true);
            setSeconds(30);
            setShowMessage(false);
            setWMessage("");
        }, 2000);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            seconds > 0 && setSeconds((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [seconds]);

    return (
        <div className="flex justify-center items-center h-screen gap-100 dark:bg-gray-950">
            {showMessage && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 rounded text-green-600 px-8 py-4 shadow-lg bg-green-600/15">
                    {message}
                </div>
            )}
            {showWarning && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 rounded text-red-600 px-8 py-4 shadow-lg bg-red-600/15">
                    {wMessage}
                </div>
            )}
            <div className="w-[20%] h-full hidden justify-center items-center lg:flex">
                <img src={Logo} alt="Brand" />
            </div>
            <form
                className="h-full w-97.5 flex justify-center items-center flex-col gap-8"
                onSubmit={handleForgotPassword}
            >
                <div className="flex justify-center items-center flex-col gap-4">
                    <img src={Logo} alt="Brand" width="60" height="60" />
                    <h1 className="text-4xl font-semibold text-gray-900 dark:text-white">
                        Reset Password
                    </h1>
                    <p className="text-lg text-gray-400">
                        Please enter your email.
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
                            value={email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            className="w-full p-2.5 border border-gray-600 rounded-md text-base"
                            required
                        />
                    </div>
                    <div
                        className={`text-gray-400 self-start flex items-center gap-1 px-1 ${warningStyle.email} ${warningStyle.emoving ? "animate-shake-right" : ""}`}
                        onAnimationEnd={() =>
                            setWarningStyle((prev) => ({
                                ...prev,
                                email: "text-gray-400",
                                emoving: false,
                            }))
                        }
                    >
                        <div className="flex items-center justify-center gap-1">
                            <div className="flex items-center justify-center w-2.5 h-2.5 rounded-full border">
                                {warningStyle.email === "text-green-500" && (
                                    <Check className="w-3 h-3 stroke-3" />
                                )}
                            </div>
                            Must be valid email.
                        </div>
                    </div>
                </div>
                <div className="w-full flex justify-center items-center flex-col gap-5 -mt-5">
                    {sent && (
                        <div className="text-gray-400">
                            <span className="text-gray-300">
                                Didn't get the link?
                            </span>{" "}
                            <button
                                disabled={sent && seconds > 0}
                                className={`cursor-pointer ${seconds < 1 && "hover:text-blue-600"}`}
                            >
                                Resend{" "}
                                {seconds > 0 && (
                                    <span>in {seconds} seconds</span>
                                )}
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={sent && seconds > 0}
                        className="text-lg text-white bg-blue-500 dark:bg-blue-600 font-normal cursor-pointer border-none rounded-md w-full p-2.5"
                    >
                        Send Email
                    </button>
                </div>
            </form>
        </div>
    );
}
