import { createContext, useContext, useState } from "react";
import { useAuth } from "./auth";
import { Pagination, SalesDatas } from "../types/types";
import { useProduct } from "./products";

interface SalesContextType {
    sales: SalesDatas[];
    pagination: Pagination | null;
    fetchSales: (page?: number, limit?: number) => Promise<void>;
    deleteSales: (saleIds: number[]) => void;
}

const SalesContext = createContext<SalesContextType | null>(null);

export function SalesProvider({ children }: { children: React.ReactNode }) {
    const { logout } = useAuth();
    const { fetchProduct } = useProduct();
    const [sales, setSales] = useState<SalesDatas[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);

    const fetchSales = async (page?: number, limit?: number) => {
        try {
            const response = async () => {
                return await fetch(
                    `/api/sales?limit=${limit ? limit : 10}${page ? `&page=${page}` : ""}`,
                    {
                        credentials: "include",
                    },
                );
            };
            const res = await response();
            const data = await res.json();

            if (res.status === 200) {
                setSales(data.sales);
                setPagination(data.pagination);
            } else if (res.status === 401) {
                const refreshResponse = await fetch("/auth/token", {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (refreshResponse.status === 200) {
                    const res = await response();
                    const data = await res.json();
                    setSales(data.sales);
                    setPagination(data.pagination);
                } else if (refreshResponse.status === 401) {
                    logout();
                }
            }
        } catch (error) {
            console.error("Error fetching sales data:", error);
        }
    };
    const deleteSales = async (saleIds: number[]) => {
        const deleteSales = async () => {
            return await fetch("/api/deleteSales", {
                method: "DELETE",
                credentials: "include",
                body: JSON.stringify({ ids: saleIds }),
            });
        };

        const res = await deleteSales();

        if (res.status === 200) await fetchSales();
        else if (res.status === 401) {
            const refreshResponse = await fetch("/auth/token", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (refreshResponse.status === 200) {
                await deleteSales();
                await fetchSales();
                fetchProduct();
            } else if (refreshResponse.status === 401) {
                logout();
            }
        }
    };

    return (
        <SalesContext.Provider
            value={{ sales, pagination, fetchSales, deleteSales }}
        >
            {children}
        </SalesContext.Provider>
    );
}

export function useSales() {
    const context = useContext(SalesContext);

    if (!context) {
        throw new Error("useSales must be used within SalesProvider");
    }

    return context;
}
