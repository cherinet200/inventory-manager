import { createFileRoute } from "@tanstack/react-router";
import { Th, Td } from "../components/table";
import { useEffect, useRef, useState } from "react";
import { useSales } from "../contexts/sales";
import {
    ListFilter,
    Trash2,
    LoaderCircle,
    CircleCheck,
    BadgeDollarSign,
    PackageOpen,
} from "lucide-react";

type ContextMenu = {
    x: number;
    y: number;
    salesId: string;
};

export const Route = createFileRoute("/_auth/sales")({
    component: RouteComponent,
});

function RouteComponent() {
    const { sales, fetchSales, deleteSales, pagination } = useSales();
    const [isLoading, setIsLoading] = useState(true);
    const [selected, setSelected] = useState<number[]>([]);
    const contextMenuRef = useRef<HTMLDivElement>(null);
    const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);

    const SalesId: number[] = [];
    sales.map((sale) => SalesId.push(sale.id));

    const handleSalesActions = (
        e: React.MouseEvent<HTMLTableRowElement>,
        salesId: string,
    ) => {
        e.preventDefault();

        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            salesId,
        });
    };

    useEffect(() => {
        const clickOutside = (event: MouseEvent) => {
            if (
                contextMenuRef &&
                !contextMenuRef.current?.contains(event.target as Node)
            ) {
                setContextMenu(null);
            }
        };

        document.addEventListener("mousedown", clickOutside);

        const fetchThem = async () => {
            try {
                fetchSales();
            } catch (err) {
            } finally {
                setIsLoading(false);
            }
        };

        fetchThem();

        return () => {
            document.removeEventListener("mousedown", clickOutside);
        };
    }, []);
    return (
        <div className="flex flex-col m-10 py-8 bg-white dark:bg-gray-950 rounded-md">
            {contextMenu && (
                <div
                    ref={contextMenuRef}
                    className="fixed z-30 w-32 rounded-md shadow-lg dark:bg-gray-800"
                    style={{
                        left: contextMenu.x,
                        top: contextMenu.y,
                    }}
                >
                    <button
                        onClick={() => {
                            if (selected.length !== 0) {
                                if (selected.includes(+contextMenu.salesId)) {
                                    setContextMenu(null);
                                } else {
                                    setSelected((prev) => [
                                        ...prev,
                                        +contextMenu.salesId,
                                    ]);
                                }
                            } else {
                                setSelected((prev) => [
                                    ...prev,
                                    +contextMenu.salesId,
                                ]);
                            }
                            setContextMenu(null);
                        }}
                        className="flex w-full items-center rounded-lg gap-2 px-4 py-2 hover:bg-gray-700"
                    >
                        <CircleCheck className="h-4 w-4" />
                        Select
                    </button>
                    <button
                        onClick={() => {
                            // Show Parent Product of The Sale
                            setContextMenu(null);
                        }}
                        className="flex w-full items-center rounded-lg gap-2 px-4 py-2 hover:bg-gray-700"
                    >
                        <BadgeDollarSign className="h-4 w-4" />
                        Product
                    </button>
                    <button
                        onClick={() => {
                            const selectedSales = sales.filter(
                                (sale) => sale.id === +contextMenu.salesId,
                            );
                            console.log(selectedSales);
                            deleteSales([+contextMenu.salesId], selectedSales);
                            setSelected([]);
                            setContextMenu(null);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-4 py-2 hover:text-red-600 hover:bg-gray-700"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </button>
                </div>
            )}
            {isLoading && (
                <div className="flex justify-center gap-4">
                    <span>Fetching Sales</span>
                    <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500 [animation-delay:-0.3s] [animation-duration:1s]" />
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500 [animation-delay:-1.5s] [animation-duration:1s]" />
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500 [animation-duration:1s]" />
                    </div>
                </div>
            )}
            {!isLoading && sales.length === 0 && (
                <div className="flex flex-col justify-center items-center gap-8 h-[50dvh] p-10">
                    <div className="flex flex-col justify-center items-center">
                        <PackageOpen size={300} className="text-gray-800" />
                        <div className="text-2xl text-gray-400 font-semibold">
                            No sales found.
                        </div>
                    </div>
                    {/* <button
                            onClick={() => setSalesFormVisibility("flex")}
                            className="w-full p-2.5 rounded-md bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 dark:hover:text-gray-200 hover:cursor-pointer"
                        >
                            Sell Product
                        </button> */}
                </div>
            )}
            {!isLoading && sales.length > 0 && (
                <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-4 py-5 px-5">
                        <h2 className="text-left text-2xl text-gray-700 dark:text-gray-300">
                            Sales
                        </h2>
                        <div className="flex gap-2">
                            <button className="flex gap-2 items-center px-2 py-2 border border-gray-600 rounded-md hover:border-gray-700 hover:text-gray-400 hover:cursor-pointer">
                                <ListFilter size={16} /> Filters
                            </button>
                            <button
                                onClick={() => {
                                    const selectedSales = sales.filter(
                                        (sale, index) =>
                                            selected[index] === sale.id,
                                    );
                                    console.log(selectedSales);
                                    deleteSales(selected, selectedSales);
                                    setSelected([]);
                                }}
                                className={`flex gap-2 items-center px-2 py-2 border border-gray-600 rounded-md hover:border-red-600 hover:text-red-600 hover:cursor-pointer ${selected.length < 1 && "text-gray-400"}`}
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                        </div>
                    </div>
                    <table className="divide-y divide-gray-100 dark:divide-gray-900">
                        <thead className="sticky top-22 bg-white dark:bg-gray-950">
                            <tr className="">
                                <Th style="flex gap-4 items-center">
                                    {selected.length !== 0 && (
                                        <input
                                            type="checkbox"
                                            name="check"
                                            id="checkSales"
                                            className="appearance-none w-3 h-3 rounded-[100px] border-2 border-gray-500 bg-black checked:border-blue-600 cursor-pointer"
                                            checked={
                                                selected.length ===
                                                SalesId.length
                                            }
                                            onChange={() => {
                                                selected.length !==
                                                SalesId.length
                                                    ? setSelected(SalesId)
                                                    : setSelected([]);
                                            }}
                                        />
                                    )}
                                    Product
                                </Th>
                                <Th>Price</Th>
                                <Th>Quantity</Th>
                                <Th>Total</Th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                            {sales.map((sale, index) => (
                                <tr
                                    key={index}
                                    onClick={() => {
                                        selected.length !== 0 &&
                                            setSelected((prev) =>
                                                prev.includes(sale.id)
                                                    ? prev.filter(
                                                          (id) =>
                                                              id !== sale.id,
                                                      )
                                                    : [...prev, sale.id],
                                            );
                                    }}
                                    onContextMenu={(e) =>
                                        handleSalesActions(e, sale.id + "")
                                    }
                                    className="hover:bg-gray-100 dark:hover:bg-gray-900"
                                >
                                    <Td style="flex gap-4 items-center">
                                        {selected.length !== 0 && (
                                            <input
                                                type="checkbox"
                                                name="check"
                                                id={sale.id + ""}
                                                className="appearance-none w-3 h-3 rounded-[100px] border-2 border-gray-500 bg-black checked:border-blue-600 cursor-pointer"
                                                checked={
                                                    selected.includes(
                                                        sale.id,
                                                    ) && true
                                                }
                                                onChange={() => {
                                                    setSelected((prev) => [
                                                        ...prev,
                                                    ]);
                                                }}
                                            />
                                        )}
                                        {sale.name}
                                    </Td>
                                    <Td>${sale.price}</Td>
                                    <Td>{sale.quantity}</Td>
                                    <Td>${sale.total}</Td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot
                            className={
                                pagination &&
                                !pagination.hasPreviousPage &&
                                !pagination.hasNextPage
                                    ? "hidden"
                                    : ""
                            }
                        >
                            <tr>
                                <Td colSpan={7}>
                                    <div className="flex items-center justify-between">
                                        <button
                                            className={`border px-5 py-2 rounded-lg ${pagination && !pagination.hasPreviousPage && "text-gray-600"}`}
                                            onClick={async () => {
                                                pagination &&
                                                    (await fetchSales(
                                                        pagination.page - 1,
                                                    ));
                                            }}
                                            disabled={
                                                pagination
                                                    ? !pagination.hasPreviousPage
                                                    : true
                                            }
                                        >
                                            Previous
                                        </button>
                                        <div className="dark:text-gray-500">
                                            Page{" "}
                                            {pagination && pagination!.page} of{" "}
                                            {pagination &&
                                                pagination!.totalPages}
                                        </div>
                                        <button
                                            className={`border px-5 py-2 rounded-lg ${pagination && !pagination.hasNextPage && "text-gray-600"}`}
                                            onClick={async () => {
                                                pagination &&
                                                    (await fetchSales(
                                                        pagination.page + 1,
                                                    ));
                                            }}
                                            disabled={
                                                pagination
                                                    ? !pagination.hasNextPage
                                                    : true
                                            }
                                        >
                                            Next
                                        </button>
                                    </div>
                                </Td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}
        </div>
    );
}
