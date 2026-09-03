import { createContext, useContext, useState } from "react";
import { Pagination, SalesDatas } from "../types/types";

interface SalesContextType {
    sales: SalesDatas[];
    pagination: Pagination | null;
    fetchSales: (page?: number, limit?: number) => Promise<void>;
    deleteSales: (saleIds: number[], sales: any) => void;
}

const SalesContext = createContext<SalesContextType | null>(null);

export function SalesProvider({ children }: { children: React.ReactNode }) {
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

            if (data.shouldRefresh) {
                window.location.reload();
            }

            if (res.status === 200) {
                setSales(data.sales);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error("Error fetching sales data:", error);
        }
    };
    const deleteSales = async (saleIds: number[], sales: any) => {
        const deleteSales = async () => {
            return await fetch("/api/deleteSales", {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ids: saleIds, sales }),
            });
        };

        const res = await deleteSales();
        const data = await res.json();

        if (data.shouldRefresh) {
            window.location.reload();
        }

        if (res.status === 200) await fetchSales();
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
