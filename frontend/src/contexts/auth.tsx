import { createContext, useContext, useState } from "react";
import { User } from "../types/types";
import Cookies from "js-cookie";

interface AuthContextType {
    user: User | null;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const stored = Cookies.get("user");

        if (!stored) return null;

        return JSON.parse(stored);
    });

    async function logout() {
        await fetch("/api/logout", {
            method: "POST",
            credentials: "include",
        });

        window.location.href = "/signin";
    }

    return (
        <AuthContext.Provider value={{ user, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const auth = useContext(AuthContext);

    return auth as AuthContextType;
}
