import { createContext, useContext, useState } from "react";
import { User } from "../types/types";
import Cookies from "js-cookie";

interface AuthContextType {
    user: User | null;
    token: string | null;
    refToken: string | null;
    login: (user: User, token: string) => void;
    logout: () => void;
    refreshToken: (newToken: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const stored = Cookies.get("user");

        if (!stored) return null;

        return JSON.parse(stored);
    });
    const [token, setToken] = useState<string | null>(() => {
        const stored = Cookies.get("token");

        if (!stored) return null;

        return stored;
    });
    const [refToken, setRefToken] = useState<string | null>(() => {
        const stored = Cookies.get("refToken");

        if (!stored) return null;

        return stored ? stored : "";
    });

    function login(user: User, token: string) {
        const strUser = JSON.stringify(user);
        Cookies.set("token", token, {
            expires: 1,
            secure: true,
            sameSite: "strict",
        });
        Cookies.set("user", strUser, {
            expires: 7,
            secure: true,
            sameSite: "strict",
        });
        setToken(token);
        setUser(user);
    }

    function logout() {
        Cookies.remove("token");
        Cookies.remove("refToken");
        Cookies.remove("user");
        setToken(null);
        setRefToken(null);
        setUser(null);
        window.location.href = "/";
    }

    function refreshToken(newToken: string) {
        Cookies.set("token", newToken, {
            expires: 1,
            secure: true,
            sameSite: "strict",
        });
        setToken(newToken);
    }

    return (
        <AuthContext.Provider
            value={{ user, token, refToken, refreshToken, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const auth = useContext(AuthContext);

    return auth as AuthContextType;
}
