import { useEffect, useRef, useState } from "react";

interface HandleChangeProps {
    n: number;
}

interface Verification {
    name: string;
    email: string;
    password: string;
    code: number;
}

interface FormData {
    name: string;
    email: string;
    password: string;
    cPassword: string;
}

interface FormProps {
    data: FormData;
}

export const handleVerification = async (data: Verification) => {
    const { name, email, password, code } = data;
    const res = await fetch("/auth/codeVerification", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, code }),
    });
    const response = await res.json();
    console.log(response);
};

export default function VerifyCode({ data }: FormProps) {
    const [value, setValue] = useState(["", "", "", "", "", ""]);
    const inputRef = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (code: string, index: number) => {
        if (!/^\d?$/.test(code)) return;

        const newValue = [...value];
        newValue[index] = code;

        setValue(newValue);

        if (code && index < value.length - 1)
            inputRef.current[index + 1]?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === "Backspace" && !value[index] && index > 0) {
            inputRef.current[index - 1]?.focus();
        }
    };

    return (
        <div className="flex flex-col gap-8 w-full">
            <div className="flex gap-4">
                {value.map((digit, index) => (
                    <input
                        type="number"
                        name="code"
                        id="code"
                        maxLength={1}
                        value={digit}
                        key={index}
                        ref={(input) => {
                            inputRef.current[index] = input;
                        }}
                        onChange={(e) => {
                            handleChange(e.target.value, index);
                        }}
                        onKeyDown={(e) => {
                            handleKeyDown(e, index);
                        }}
                        className="w-15 h-15 p-2.5 border border-gray-200 dark:border-gray-600 rounded-md text-2xl text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        autoFocus={index === 0}
                        required
                    />
                ))}
            </div>
            <button
                type="submit"
                onClick={() => {
                    handleVerification({
                        name: data.name,
                        email: data.email,
                        password: data.password,
                        code: +value.join(""),
                    });
                }}
                className="text-lg text-white bg-blue-500 dark:bg-blue-600 font-normal cursor-pointer border-none rounded-md w-full p-2.5"
            >
                Verify your code
            </button>
        </div>
    );
}
