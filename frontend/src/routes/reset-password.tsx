import { createFileRoute } from "@tanstack/react-router";
import brandLogo from "../assets/inventory.png";
import { useState } from "react";
import { EyeOff, Eye, Check } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
    validateSearch: (search: Record<string, unknown>) => ({
        token: typeof search.token === "string" ? search.token : undefined,
    }),
    component: RouteComponent,
});

function RouteComponent() {
    const [formData, setFormData] = useState({
        password: "",
        cPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [warningStyle, setWarningStyle] = useState({
        length: "",
        match: "",
        lmoving: false,
        mmoving: false,
    });
    const { token } = Route.useSearch();
    !token && (window.location.href = "/dashboard");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target as typeof e.target & {
            name: string;
            value: string;
        };

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

        // Change the form data
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

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
    };

    const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();

        const handleSend = async () => {
            const res = await fetch("/auth/changePassword", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    token,
                }),
            });

            const data = await res.json();

            if (res.status === 400) {
                setMessage(data.message);
            }

            if (res.status === 200) window.location.href = "/signin";
        };

        const handleMatch = () => {
            formData.password === formData.cPassword
                ? handleSend()
                : setWarningStyle((prev) => ({
                      ...prev,
                      match: "text-red-600",
                      mmoving: true,
                  }));
        };

        formData.password.length >= 8
            ? handleMatch()
            : setWarningStyle((prev) => ({
                  ...prev,
                  length: "text-red-600",
                  lmoving: true,
              }));
    };

    return (
        <div className="flex h-screen justify-center items-center dark:bg-black">
            {message && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 rounded text-red-600 px-8 py-4 shadow-lg bg-red-600/15">
                    {message}
                </div>
            )}
            <form
                className="w-97.5 flex justify-center items-center flex-col gap-8"
                onSubmit={handleSubmit}
            >
                <div className="flex justify-center items-center flex-col gap-4">
                    <img src={brandLogo} alt="Brand" width="60" height="60" />
                    <h1 className="text-4xl font-semibold text-gray-900 dark:text-white">
                        Change Password
                    </h1>
                    <p className="text-lg text-gray-400">
                        Please enter your new password.
                    </p>
                </div>
                <div className="w-full flex justify-center items-center flex-col gap-2">
                    <div className="w-full">
                        <label
                            htmlFor="password"
                            className="self-start text-base text-gray-600 dark:text-gray-300 font-medium"
                        >
                            New Password*
                        </label>
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
                    </div>
                    <div className="w-full">
                        <label
                            htmlFor="cPassword"
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
                                placeholder="Confirm your password"
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
                <button
                    type="submit"
                    className="text-lg text-white bg-blue-500 dark:bg-blue-600 font-normal cursor-pointer border-none rounded-md w-full p-2.5"
                >
                    Change Password
                </button>
            </form>
        </div>
    );
}
