import * as React from "react";
import {
    Html,
    Head,
    Body,
    Preview,
    Container,
    Heading,
    Text,
    Button,
    Tailwind,
} from "react-email";

const resetPasswordEmail = ({
    resetPasswordUrl,
}: {
    resetPasswordUrl: string;
}) => {
    return (
        <Tailwind>
            <Html lang="en">
                <Head />

                <Preview>Reset Your Inventory Manager Password</Preview>

                <Body className="m-0 bg-gray-100 p-10 text-lg font-sans">
                    <Container className="mx-auto max-w-xl bg-white shadow-2xl p-10 flex justify-center items-center">
                        <div className="mx-100">
                            <Heading className="text-2xl font-bold text-center font-playfair">
                                Reset Your Password
                            </Heading>

                            <Text className="text-gray-600">
                                You requested to reset your Inventory Manager
                                password.
                            </Text>

                            <Text className="text-gray-600">
                                Click the button below to choose a new password.
                            </Text>

                            <Button
                                href={resetPasswordUrl}
                                className="rounded-lg my-6 px-3 py-1.5 bg-blue-500 text-white text-center font-semibold w-full"
                            >
                                Reset Password
                            </Button>

                            <Text className="text-sm">
                                This link will expire in 10 minutes
                            </Text>

                            <Text className="text-sm">
                                If you didn't request a password reset, you can
                                safely ignore this email.
                            </Text>
                        </div>
                    </Container>
                </Body>
            </Html>
        </Tailwind>
    );
};

export default resetPasswordEmail;
