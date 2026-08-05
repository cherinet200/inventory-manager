import { createContext, useContext, useEffect, useState } from "react";
import type { Product } from "../types/types";
import { useAuth } from "./auth";
import Cookies from "js-cookie";

interface queryType {
    query?: string | undefined;
}

interface ProductContextType {
    products: Product[];
    fetchProduct: (query: queryType) => Promise<void>;
    setProduct: (products: Product[]) => void;
}

const ProductContext = createContext<ProductContextType | null>(null);

export function ProductProvider({ children }: { children: React.ReactNode }) {
    const { token, refToken, refreshToken, logout } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);

    const fetchProduct = async ({ query }: queryType = {}) => {
        const fetchProducts = async (token: string | null) => {
            return await fetch(
                `/api/getProducts?limit=10${query ? `${query}` : ""}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
        };
        const res = await fetchProducts(token);
        const data = await res.json();
        if (res.status === 200) setProducts(data.products);
        else if (res.status === 401) {
            const tokendata = { token: refToken };
            const refreshRes = await fetch("/auth/token", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...tokendata }),
            });
            const refreshData = await refreshRes.json();

            if (refreshRes.status === 200) {
                const res = await fetchProducts(refreshData.accessToken);
                const data = await res.json();
                setProducts(data.products);
            } else if (refreshRes.status === 401) {
                logout();
            }
        }
    };

    const setProduct = (products: Product[]) => {
        setProducts(products);
    };

    return (
        <ProductContext.Provider value={{ products, fetchProduct, setProduct }}>
            {children}
        </ProductContext.Provider>
    );
}

export function useProduct() {
    const context = useContext(ProductContext);

    if (!context) {
        throw new Error("useProduct must be used within ProductProvider");
    }

    return context;
}
