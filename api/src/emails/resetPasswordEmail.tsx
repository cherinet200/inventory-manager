import path from "path";
import * as React from "react";
import {
    Html,
    Head,
    Body,
    Preview,
    Heading,
    Container,
    Text,
    Button,
    Tailwind,
} from "react-email";

const resetPasswordEmail = ({
    resetPasswordUrl,
}: {
    resetPasswordUrl: string;
}) => {
    const imagePath = "https://i.postimg.cc/fbRKcWFw/inventory.png";

    return (
        <Tailwind>
            <Html lang="en">
                <Head />

                <Preview>Reset Your Inventory Manager Password</Preview>

                <Body className="flex flex-col justify-center items-center m-0">
                    <Container>
                        <div className="m-0 mx-auto bg-gray-100 p-10 text-lg font-sans max-w-xl flex justify-center items-center text center">
                            <div className="mx-auto max-w-xl bg-white shadow-2xl p-10 flex justify-center items-center">
                                <div className="max-w-xl">
                                    <Heading className="text-2xl font-bold text-center font-playfair">
                                        <div>
                                            <div className="flex items-center w-full px-9 py-4">
                                                <img
                                                    src={imagePath}
                                                    alt="Logo"
                                                    width="70"
                                                    height="70"
                                                />
                                                <h2 className="font-playfair text-2xl text-blue-500 dark:text-blue-600 font-bold">
                                                    INVENTORY MANAGER
                                                </h2>
                                            </div>
                                            Reset Your Password
                                        </div>
                                    </Heading>

                                    <Text className="text-gray-600">
                                        You requested to reset your Inventory
                                        Manager password.
                                    </Text>

                                    <Text className="text-gray-600">
                                        Click the button below to create a new
                                        password.
                                    </Text>

                                    <Button
                                        href={resetPasswordUrl}
                                        className="rounded-lg my-2 px-3 py-1.5 bg-blue-500 text-white text-center font-semibold w-[94.5%]"
                                    >
                                        Reset Password
                                    </Button>

                                    <Text className="text-sm">
                                        This link will expire in 10 minutes
                                    </Text>

                                    <Text className="text-sm">
                                        If you didn't request a password reset,
                                        you can safely ignore this email.
                                    </Text>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-1 items-center justify-center text-gray-500 mt-4">
                            <span className="w-[32.9%]"></span>
                            <span className="text-center">
                                © 2026 Inventory Manager
                            </span>
                            <span className="w-[32.9%]"></span>
                        </div>
                    </Container>
                </Body>
            </Html>
        </Tailwind>
    );
};

export default resetPasswordEmail;
