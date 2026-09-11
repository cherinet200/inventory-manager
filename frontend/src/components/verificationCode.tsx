import { useEffect, useRef, useState } from "react";

interface Verification {
    id: string;
    code: number;
}

interface FormProps {
    id: string;
    setShowMessage: React.Dispatch<React.SetStateAction<boolean>>;
}

export const handleVerification = async (
    data: Verification,
    setShowMessage: React.Dispatch<React.SetStateAction<boolean>>,
    setMessage: React.Dispatch<React.SetStateAction<string | null>>,
) => {
    const { id, code } = data;
    console.log(id);
    const res = await fetch("/auth/codeVerification", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, code }),
    });
    const response = await res.json();

    if (response.success) {
        setShowMessage(true);

        window.location.href = "/dashboard";
    } else {
        setMessage(response.message);
    }
};

export default function VerifyCode({ id, setShowMessage }: FormProps) {
    const [value, setValue] = useState(["", "", "", "", "", ""]);
    const inputRef = useRef<(HTMLInputElement | null)[]>([]);
    const [message, setMessage] = useState<string | null>(null);

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
        } else if (e.key === "Enter" && !value[index]) {
            handleVerification(
                {
                    id,
                    code: +value.join(""),
                },
                setShowMessage,
                setMessage,
            );
        }
    };

    const handlePaste = (
        e: React.ClipboardEvent<HTMLInputElement>,
        index: number,
    ) => {
        e.preventDefault();

        const copiedText = e.clipboardData.getData("text");
        const copiedCodes = copiedText.split("");

        if (copiedCodes.length === value.length) {
            setValue(copiedCodes);
            inputRef.current[5]?.focus();
        }
    };

    return (
        <div className="flex flex-col gap-8 w-full">
            {message && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 rounded text-red-600 px-8 py-4 shadow-lg border border-red-600">
                    {message}
                </div>
            )}
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
                        onPaste={(e) => {
                            handlePaste(e, index);
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
                    handleVerification(
                        {
                            id,
                            code: +value.join(""),
                        },
                        setShowMessage,
                        setMessage,
                    );
                }}
                className="text-lg text-white bg-blue-500 dark:bg-blue-600 font-normal cursor-pointer border-none rounded-md w-full p-2.5"
            >
                Verify your code
            </button>
        </div>
    );
}
