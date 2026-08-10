import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "../contexts/auth";
import { useEffect, useState } from "react";
import { Td, Th } from "../components/table";
import { useProduct } from "../contexts/products";
import type { Product } from "../types/types";
import {
    ListFilter,
    Trash2,
    LoaderCircle,
    CircleCheck,
    Pencil,
} from "lucide-react";

export const Route = createFileRoute("/_auth/inventory")({
    component: Inventory,
});

interface Sale {
    productId: 60;
    quantity: 1;
    price: 125;
    total: 500;
}

type ContextMenu = {
    x: number;
    y: number;
    productId: string;
};

function Inventory() {
    const { token } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const { products, fetchProduct, setFormVisibility } = useProduct();
    const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
    const ProductsId: number[] = [];
    products.map((product) => ProductsId.push(product.id));
    const [selected, setSelected] = useState<number[]>([]);

    const handleProductActions = (
        e: React.MouseEvent<HTMLTableRowElement>,
        productId: string,
    ) => {
        e.preventDefault();

        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            productId,
        });
    };

    useEffect(() => {
        async function fetchThem() {
            try {
                await fetchProduct();
            } finally {
                setIsLoading(false);
            }
        }
        fetchThem();
    }, []);

    const date = (date: string) => {
        return date.slice(0, 10);
    };

    return (
        <div className="flex flex-col m-10 py-8 bg-white dark:bg-gray-950 rounded-md">
            {contextMenu && (
                <div
                    className="fixed z-30 w-32 rounded-lg shadow-lg dark:bg-gray-800 left-[]"
                    style={{
                        left: contextMenu.x,
                        top: contextMenu.y,
                    }}
                >
                    <button
                        onClick={() => {
                            setSelected((prev) => [
                                ...prev,
                                +contextMenu.productId,
                            ]);
                            setContextMenu(null);
                        }}
                        className="flex w-full items-center justify-center rounded-xl gap-2 px-4 py-2 hover:bg-gray-700"
                    >
                        <CircleCheck className="h-4 w-4" />
                        Select
                    </button>
                    <button
                        onClick={() => {
                            setContextMenu(null);
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 hover:text-red-600 hover:bg-gray-700"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </button>
                </div>
            )}
            <div className="flex justify-between items-center mb-4 py-5 px-5">
                <h2 className="text-left text-2xl text-gray-700 dark:text-gray-300">
                    Products
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFormVisibility("flex")}
                        className="px-2 py-2 rounded-md bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 dark:hover:text-gray-200 hover:cursor-pointer"
                    >
                        Add Product
                    </button>
                    <button className="flex gap-2 items-center px-2 py-2 border border-gray-600 rounded-md hover:border-gray-700 hover:text-gray-400 hover:cursor-pointer">
                        <ListFilter size={16} /> Filters
                    </button>
                    <button className="flex gap-2 items-center px-2 py-2 border border-gray-600 rounded-md hover:border-amber-600 hover:text-amber-600 hover:cursor-pointer">
                        <Pencil size={16} /> Edit
                    </button>
                    <button className="flex gap-2 items-center px-2 py-2 border border-gray-600 rounded-md hover:border-red-600 hover:text-red-600 hover:cursor-pointer">
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
                                    id="checkAll"
                                    className="appearance-none w-3 h-3 rounded-[100px] border-2 border-gray-500 bg-black checked:border-blue-800 cursor-pointer"
                                    onChange={() => {
                                        selected.length !== ProductsId.length
                                            ? setSelected(ProductsId)
                                            : setSelected([]);
                                    }}
                                    checked={
                                        selected.length === ProductsId.length
                                    }
                                />
                            )}
                            name
                        </Th>
                        <Th>Buyingprice</Th>
                        <Th>Sellingprice</Th>
                        <Th>Quantity</Th>
                        <Th>Threshold</Th>
                        <Th>Expirydate</Th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                    {isLoading && (
                        <tr>
                            <Td
                                colSpan={7}
                                style="text-center text-4xl dark:text-gray-600 font-bold"
                            >
                                <LoaderCircle className="w-full animate-spin" />
                            </Td>
                        </tr>
                    )}
                    {products.map((product) => (
                        <tr
                            key={product.id}
                            className="hover:bg-gray-100 dark:hover:bg-gray-900"
                            onClick={() => {
                                selected.length !== 0 &&
                                    setSelected((prev) =>
                                        prev.includes(product.id)
                                            ? prev.filter(
                                                  (id) => id !== product.id,
                                              )
                                            : [...prev, product.id],
                                    );
                            }}
                            onContextMenu={(e) =>
                                handleProductActions(e, product.id + "")
                            }
                        >
                            <Td style="first-letter:uppercase flex gap-4 items-center">
                                {selected.length !== 0 && (
                                    <input
                                        type="checkbox"
                                        name="check"
                                        id={product.id + ""}
                                        className="appearance-none w-3 h-3 rounded-[100px] border-2 border-gray-500 bg-black checked:border-blue-800 cursor-pointer"
                                        checked={
                                            selected.includes(product.id) &&
                                            true
                                        }
                                        onChange={() => {
                                            setSelected((prev) => [...prev]);
                                        }}
                                    />
                                )}
                                {product.name}
                            </Td>
                            <Td>{product.buyingprice}</Td>
                            <Td>{product.sellingprice}</Td>
                            <Td>{product.quantity + " " + product.unit}</Td>
                            <Td>{product.threshold}</Td>
                            <Td>{date(product.expirydate)}</Td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
