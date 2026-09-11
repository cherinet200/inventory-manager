import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import brandLogo from "../assets/inventory.png";
import { Link } from "@tanstack/react-router";
import { Eye, EyeOff, Check } from "lucide-react";
import VerifyCode, { handleVerification } from "../components/verificationCode";
import AuthLayout, { FormLayout } from "../components/authLayout";

export const Route = createFileRoute("/signup")({
    component: Signup,
});

function Signup() {
    const [showMessage, setShowMessage] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [signUpId, setSignUpId] = useState<string | null>(null);
    const passwordRef = useRef<(HTMLInputElement | null)[]>([]);
    const [warningMessage, setWarningMessage] = useState(
        "User already exists!",
    );
    const [showPassword, setShowPassword] = useState(false);
    const [verification, setVerification] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
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

        const password = passwordRef.current[1]?.value;
        const cpassword = passwordRef.current[2]?.value;

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
        password &&
            cpassword &&
            password?.length > 0 &&
            cpassword?.length > 0 &&
            (password === cpassword
                ? setWarningStyle((prev) => ({
                      ...prev,
                      match: "text-green-500",
                      mmoving: false,
                  }))
                : setWarningStyle((prev) => ({
                      ...prev,
                      match: "text-gray-400",
                      mmoving: false,
                  })));

        // Valid email

        name === "email" &&
            (isValidEmail(value)
                ? setWarningStyle((prev) => ({
                      ...prev,
                      email: "text-green-500",
                      emoving: false,
                  }))
                : setWarningStyle((prev) => ({
                      ...prev,
                      email: "text-gray-400",
                      emoving: false,
                  })));
    };

    const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsLoading(true);

        const password = passwordRef.current[1]?.value;
        const cpassword = passwordRef.current[2]?.value;

        if (!isValidEmail(formData.email)) {
            setIsLoading(false);
            return;
        }
        if (password === cpassword && password!.length >= 8) {
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
                setSignUpId(response.id);
                setVerification(true);
            } else {
                setWarningMessage(response.message);
                setShowWarning(true);
                setTimeout(() => {
                    setShowWarning(false);
                }, 5000);
                setVerification(false);
            }

            if (res.status === 400 || res.status === 500) {
                setWarningMessage(response.message);
                setShowWarning(true);
                setTimeout(() => {
                    setShowWarning(false);
                }, 5000);
            }
            setIsLoading(false);
        } else {
            password!.length > 0 &&
                cpassword!.length > 0 &&
                (password === cpassword
                    ? setWarningStyle((prev) => ({
                          ...prev,
                          match: "text-green-500",
                          mmoving: false,
                      }))
                    : setWarningStyle((prev) => ({
                          ...prev,
                          match: "text-red-600",
                          mmoving: true,
                      })));

            password!.length >= 8
                ? setWarningStyle((prev) => ({
                      ...prev,
                      length: "text-green-500",
                      lmoving: false,
                  }))
                : setWarningStyle((prev) => ({
                      ...prev,
                      length: "text-red-600",
                      lmoving: true,
                  }));
            setIsLoading(false);
            return;
        }
    };

    return (
        <AuthLayout>
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
            {verification ? (
                signUpId && (
                    <FormLayout
                        onSubmit={async (e) => {
                            e.preventDefault();
                        }}
                        title="Enter Verification Code"
                        subtitle="Please enter the verification code sent to your email."
                    >
                        <VerifyCode
                            id={signUpId}
                            setShowMessage={setShowMessage}
                        />
                    </FormLayout>
                )
            ) : (
                <FormLayout
                    onSubmit={handleSubmit}
                    title="Create an account"
                    subtitle="Please enter your details to get started."
                >
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
                                autoFocus
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
                                    ref={(element) => {
                                        passwordRef.current[1] = element;
                                    }}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-md text-base"
                                    required
                                />
                                <div
                                    className="absolute right-2 text-gray-600 dark:text-gray-400"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
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
                                    ref={(element) => {
                                        passwordRef.current[2] = element;
                                    }}
                                    value={formData.cPassword}
                                    onChange={handleChange}
                                    placeholder="Confirms your password"
                                    className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-md text-base"
                                    required
                                />
                                <div
                                    className="absolute right-2 text-gray-600 dark:text-gray-400"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
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
                            className={`text-lg flex justify-center gap-4 text-white bg-blue-500 dark:bg-blue-600 font-normal ${!isLoading ? "cursor-pointer" : "cursor-wait"} border-none rounded-md w-full p-2.5`}
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating an account" : "Get started "}
                            {isLoading && (
                                <div className="flex justify-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gray-300 [animation-delay:-0.3s] [animation-duration:1s]" />
                                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gray-300 [animation-delay:-1.5s] [animation-duration:1s]" />
                                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gray-300 [animation-duration:1s]" />
                                    </div>
                                </div>
                            )}
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
                </FormLayout>
            )}
        </AuthLayout>
    );
}

export default Signup;
