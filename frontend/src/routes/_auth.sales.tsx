import { createFileRoute } from "@tanstack/react-router";
import { Th, Td } from "../components/table";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/auth";
import { useSales } from "../contexts/sales";

export const Route = createFileRoute("/_auth/sales")({
    component: RouteComponent,
});

function RouteComponent() {
    const { sales, fetchSales, pagination } = useSales();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchThem = async () => {
            try {
                fetchSales();
            } catch (err) {
            } finally {
                setIsLoading(false);
            }
        };

        fetchThem();
    }, []);
    return (
        <div className="flex flex-col m-10 py-8 bg-white dark:bg-gray-950 rounded-md">
            <h2 className="mb-4 py-5 px-5 text-left text-2xl text-gray-700 dark:text-gray-300">
                Sales
            </h2>
            <table className="divide-y divide-gray-100 dark:divide-gray-900">
                <thead className="sticky top-22 bg-white dark:bg-gray-950">
                    <tr className="">
                        <Th>Product</Th>
                        <Th>Price</Th>
                        <Th>Quantity</Th>
                        <Th>Total</Th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                    {sales.map((sale, index) => (
                        <tr
                            key={index}
                            className="hover:bg-gray-100 dark:hover:bg-gray-900"
                        >
                            <Td>{sale.productId}</Td>
                            <Td>${sale.price}</Td>
                            <Td>{sale.quantity}</Td>
                            <Td>${sale.total}</Td>
                        </tr>
                    ))}
                </tbody>
                <tfoot
                    className={
                        !pagination.hasPreviousPage && !pagination.hasNextPage
                            ? "hidden"
                            : ""
                    }
                >
                    <tr>
                        <Td colSpan={7}>
                            <div className="flex items-center justify-between">
                                <button
                                    className={`border px-5 py-2 rounded-lg ${!pagination.hasPreviousPage && "text-gray-600"}`}
                                    onClick={async () => {
                                        await fetchSales(pagination.page - 1);
                                    }}
                                    disabled={!pagination.hasPreviousPage}
                                >
                                    Previous
                                </button>
                                <button
                                    className={`border px-5 py-2 rounded-lg ${!pagination.hasNextPage && "text-gray-600"}`}
                                    onClick={async () => {
                                        await fetchSales(pagination.page + 1);
                                    }}
                                    disabled={!pagination.hasNextPage}
                                >
                                    Next
                                </button>
                            </div>
                        </Td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}
