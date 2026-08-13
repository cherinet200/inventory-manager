import { createContext, useContext, useState } from "react";
import { useAuth } from "./auth";
import { SalesData } from "../types/types";

interface SalesContextType {
    sales: SalesData[];
    pagination: Pagination;
    fetchSales: (page?: number, limit?: number) => Promise<void>;
    deleteSales: (saleIds: number) => void;
}

interface Pagination {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
    page: number;
    total: number;
    totalPages: number;
}

const SalesContext = createContext<SalesContextType | null>(null);

export function SalesProvider({ children }: { children: React.ReactNode }) {
    const { logout, token, refToken } = useAuth();
    const [sales, setSales] = useState<SalesData[]>([]);
    const [pagination, setPagination] = useState<Pagination>(Object);

    const fetchSales = async (page?: number, limit?: number) => {
        try {
            const response = async (token: string | null) => {
                return await fetch(
                    `/api/sales?limit=${limit ? limit : 10}${page ? `&page=${page}` : ""}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );
            };
            const res = await response(token);
            const data = await res.json();

            if (res.status === 200) {
                setSales(data.sales);
                setPagination(data.pagination);
            } else if (res.status === 401) {
                const tokenData = { token: refToken };
                const refreshResponse = await fetch("/auth/token", {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ ...tokenData }),
                });
                const refRes = await refreshResponse.json();

                if (refreshResponse.status === 200) {
                    const res = await response(refRes.accessToken);
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
    const deleteSales = async (saleIds: number) => {
        const deleteSales = async (token: string | null) => {
            return await fetch("/api/deleteSales", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify({ ids: saleIds }),
            });
        };

        const res = await deleteSales(token);

        if (res.status === 200) await fetchSales();
        else if (res.status === 401) {
            const tokenData = { token: refToken };
            const refreshResponse = await fetch("/api/token", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...tokenData }),
            });
            const refRes = await refreshResponse.json();
            if (refreshResponse.status === 200) {
                await deleteSales(refRes.accessToken);
                await fetchSales();
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
