import * as React from "react";
import { Html, Head, Body, Preview, Heading, Tailwind } from "react-email";

interface UserTypes {
    id: string;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

const newLogin = ({ name, email, createdAt }: UserTypes) => {
    return (
        <Tailwind>
            <Html lang="en">
                <Head />

                <Preview>New User Account Created</Preview>

                <Body className="flex m-0">
                    <div className="m-0 mx-auto bg-gray-100 p-10 text-lg font-sans max-w-xl flex justify-center items-center text center">
                        <div className="mx-auto max-w-xl bg-white shadow-2xl p-10 flex flex-col justify-center items-center">
                            <div className="max-w-xl">
                                <span className="font-semibold">Name: </span>
                                {name}
                            </div>
                            <div className="max-w-xl">
                                <span className="font-semibold">Email: </span>
                                {email}
                            </div>
                            <div className="max-w-xl">
                                <span className="font-semibold">
                                    Created at:{" "}
                                </span>
                                {createdAt + ""}
                            </div>
                        </div>
                    </div>
                </Body>
            </Html>
        </Tailwind>
    );
};

export default newLogin;
