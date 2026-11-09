import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Td, Th } from "../components/table";
import { useProduct } from "../contexts/products";
import { FormData } from "../types/types";
import SellProduct from "../components/sellProduct";
import { EditProduct } from "../components/productForms";
import {
    ListFilter,
    Trash2,
    LoaderCircle,
    CircleCheck,
    Pencil,
    BadgeDollarSign,
    PackagePlus,
    PackageSearch,
} from "lucide-react";

export const Route = createFileRoute("/_auth/inventory")({
    component: Inventory,
});

type ContextMenu = {
    x: number;
    y: number;
    productId: string;
};

function Inventory() {
    const [isLoading, setIsLoading] = useState(true);
    const contextMenuRef = useRef<HTMLDivElement>(null);
    const {
        products,
        fetchProduct,
        deleteProduct,
        setFormVisibility,
        setEditFormVisibility,
        setSalesFormVisibility,
        pagination,
        searchedPage,
    } = useProduct();
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
        const handleClickOutside = (event: MouseEvent) => {
            if (
                contextMenuRef &&
                !contextMenuRef.current?.contains(event.target as Node)
            ) {
                setContextMenu(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        async function fetchThem() {
            try {
                await fetchProduct();
            } finally {
                setIsLoading(false);
            }
        }
        fetchThem();

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const date = (date: string) => {
        return date.slice(0, 10);
    };
    const defaultFormData: FormData = {
        productname: "",
        category: "",
        buyingprice: 0,
        sellingprice: 0,
        quantity: 0,
        unit: "",
        expirydate: new Date().toISOString().slice(0, 16),
        threshold: 0,
    };

    const renameKeys = () => {
        const product = products.find((product) => product.id === selected[0]);
        if (!product) return defaultFormData;
        const { id, name, expirydate, ...rest } = product;

        return {
            ...rest,
            productname: name,
            expirydate: new Date(expirydate).toISOString().slice(0, 16),
        };
    };

    return (
        <div className="flex flex-col m-10 py-8 bg-white dark:bg-gray-950 rounded-md">
            {selected.length === 1 && (
                <EditProduct
                    productId={selected[0]}
                    defaultFormData={renameKeys()}
                    setSelected={setSelected}
                />
            )}
            {selected.length === 1 && (
                <SellProduct
                    productId={selected[0]}
                    productData={renameKeys()}
                    setSelected={setSelected}
                />
            )}
            {contextMenu && (
                <div
                    ref={contextMenuRef}
                    className="fixed z-30 w-32 rounded-md shadow-lg bg-gray-100/70 dark:bg-gray-800 text-black dark:text-white"
                    style={{
                        left: contextMenu.x,
                        top: contextMenu.y,
                    }}
                >
                    <button
                        onClick={() => {
                            if (selected.length !== 0) {
                                if (selected.includes(+contextMenu.productId)) {
                                    setContextMenu(null);
                                } else {
                                    setSelected((prev) => [
                                        ...prev,
                                        +contextMenu.productId,
                                    ]);
                                }
                            } else {
                                setSelected((prev) => [
                                    ...prev,
                                    +contextMenu.productId,
                                ]);
                            }
                            setContextMenu(null);
                        }}
                        className="flex w-full items-center rounded-lg gap-2 px-4 py-2 hover:bg-gray-300/70 dark:hover:bg-gray-700"
                    >
                        <CircleCheck className="h-4 w-4" />
                        Select
                    </button>
                    <button
                        onClick={() => {
                            setSelected([+contextMenu.productId]);
                            setSalesFormVisibility("flex");
                            setContextMenu(null);
                        }}
                        className="flex w-full items-center rounded-lg gap-2 px-4 py-2 hover:bg-gray-300/70 dark:hover:bg-gray-700"
                    >
                        <BadgeDollarSign className="h-4 w-4" />
                        Sell
                    </button>
                    <button
                        onClick={() => {
                            setSelected([+contextMenu.productId]);
                            setEditFormVisibility("flex");
                            setContextMenu(null);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-4 py-2  hover:text-amber-600 hover:bg-gray-300/70 dark:hover:bg-gray-700"
                    >
                        <Pencil className="h-4 w-4" />
                        Edit
                    </button>
                    <button
                        onClick={() => {
                            deleteProduct([+contextMenu.productId]);
                            setSelected([]);
                            setContextMenu(null);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-4 py-2 hover:text-red-600 hover:bg-gray-300/70 dark:hover:bg-gray-700"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </button>
                </div>
            )}
            {isLoading && (
                <div className="flex justify-center gap-4">
                    <span>Fetching Products</span>
                    <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500 [animation-delay:-0.3s] [animation-duration:1s]" />
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500 [animation-delay:-1.5s] [animation-duration:1s]" />
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500 [animation-duration:1s]" />
                    </div>
                </div>
            )}
            {!isLoading && products.length === 0 && (
                <>
                    {!searchedPage ? (
                        <>
                            <div className="flex justify-between items-center mb-4 py-2 px-8 border-b border-gray-400/10">
                                <h2 className="text-left text-2xl text-gray-700 dark:text-gray-300">
                                    Products
                                </h2>
                                <span className="px-2 py-0.5 rounded-2xl bg-blue-600/10 text-blue-600/80">
                                    0 Products
                                </span>
                            </div>

                            <div className="py-5 text-center flex flex-col justify-center items-center gap-4">
                                <div className="bg-blue-600/15 p-6 rounded-full">
                                    <PackagePlus className="text-blue-600 w-10 h-10" />
                                </div>
                                <span className="font-playfair font-semibold text-black dark:text-white">
                                    No products yet
                                </span>
                                <span className="font-extralight text-gray-400">
                                    You haven't added any products to your
                                    inventory. Get started by creating your
                                    first product.
                                </span>
                                <button
                                    onClick={() => setFormVisibility("flex")}
                                    className="px-4 py-1 rounded-md bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-700/90 dark:hover:text-gray-200 hover:cursor-pointer flex justify-center items-center gap-3"
                                >
                                    <span className="text-3xl">+</span> Add Your
                                    First Product
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex justify-between items-center mb-4 py-2 px-8 border-b border-gray-400/10">
                                <h2 className="text-left text-2xl text-gray-700 dark:text-gray-300">
                                    Products
                                </h2>
                                <span className="px-2 py-0.5 rounded-2xl bg-gray-100/8 text-gray-100/50">
                                    0 Products
                                </span>
                            </div>
                            <div className="py-5 text-center flex flex-col justify-center items-center gap-4">
                                <div className="bg-blue-600/15 p-6 rounded-full">
                                    <PackageSearch className="text-blue-600 w-10 h-10" />
                                </div>
                                <span className="font-playfair font-semibold text-black dark:text-white">
                                    No products found
                                </span>
                                <span className="font-extralight text-gray-400">
                                    We couldn't find any products matching your
                                    search. Try a different keyword or check
                                    your spelling.
                                </span>
                            </div>
                        </>
                    )}
                </>
            )}
            {!isLoading && products.length > 0 && (
                <div className="flex flex-col overflow-x-auto">
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
                            <button
                                onClick={() => {
                                    if (selected.length === 1)
                                        setEditFormVisibility("flex");
                                }}
                                className={`flex gap-2 items-center px-2 py-2 border border-gray-600 rounded-md hover:border-amber-400 hover:text-amber-400 hover:cursor-pointer text-black dark:text-white ${selected.length !== 1 && "dark:text-gray-400 text-gray-500"}`}
                            >
                                <Pencil size={16} /> Edit
                            </button>
                            <button
                                onClick={() => {
                                    deleteProduct(selected);
                                    setSelected([]);
                                }}
                                className={`flex gap-2 items-center px-2 py-2 border border-gray-600 rounded-md hover:border-red-600 hover:text-red-600 hover:cursor-pointer text-black dark:text-white ${selected.length < 1 && "dark:text-gray-400 text-gray-500"}`}
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                            <button className="flex gap-2 items-center px-2 py-2 border border-gray-600 rounded-md hover:border-gray-700 hover:text-gray-400 hover:cursor-pointer text-black dark:text-white">
                                <ListFilter size={16} /> Filters
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
                                            className="appearance-none w-3 h-3 rounded-[100px] border-2 border-gray-500 bg-black checked:border-blue-600 cursor-pointer"
                                            onChange={() => {
                                                selected.length !==
                                                ProductsId.length
                                                    ? setSelected(ProductsId)
                                                    : setSelected([]);
                                            }}
                                            checked={
                                                selected.length ===
                                                ProductsId.length
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
                                    className="hover:bg-gray-100 group dark:hover:bg-gray-900"
                                    onClick={() => {
                                        selected.length !== 0 &&
                                            setSelected((prev) =>
                                                prev.includes(product.id)
                                                    ? prev.filter(
                                                          (id) =>
                                                              id !== product.id,
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
                                                className="appearance-none w-3 h-3 rounded-[100px] border-2 border-gray-500 bg-black checked:border-blue-600 cursor-pointer"
                                                checked={
                                                    selected.includes(
                                                        product.id,
                                                    ) && true
                                                }
                                                onChange={() => {
                                                    setSelected((prev) => [
                                                        ...prev,
                                                    ]);
                                                }}
                                            />
                                        )}
                                        {product.name}
                                    </Td>
                                    <Td>{product.buyingprice}</Td>
                                    <Td>{product.sellingprice}</Td>
                                    <Td>
                                        {product.quantity + " " + product.unit}
                                    </Td>
                                    <Td>{product.threshold}</Td>
                                    <Td style="flex gap-4 justify-between">
                                        {date(product.expirydate)}
                                        <div className="flex gap-4 invisible opacity-0 group-hover:visible group-hover:opacity-100 items-center  transition-opacity duration-200">
                                            <CircleCheck className="h-4 w-4" />
                                            <Pencil size={16} />
                                            <BadgeDollarSign className="h-4 w-4" />
                                            <Trash2 size={16} />
                                        </div>
                                    </Td>
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
                                    <div className="flex items-center justify-between mt-4`">
                                        <button
                                            className={`border px-5 py-2 rounded-lg ${!pagination!.hasPreviousPage && "text-gray-600"}`}
                                            onClick={async () => {
                                                await fetchProduct(
                                                    undefined,
                                                    pagination!.page - 1,
                                                );
                                                setSelected([]);
                                            }}
                                            disabled={
                                                !pagination!.hasPreviousPage
                                            }
                                        >
                                            Previous
                                        </button>
                                        <div className="dark:text-gray-500">
                                            Page {pagination && pagination.page}{" "}
                                            of{" "}
                                            {pagination &&
                                                pagination.totalPages}
                                        </div>
                                        <button
                                            className={`border px-5 py-2 rounded-lg ${!pagination!.hasNextPage && "text-gray-600"}`}
                                            onClick={async () => {
                                                await fetchProduct(
                                                    undefined,
                                                    pagination!.page + 1,
                                                );
                                                setSelected([]);
                                            }}
                                            disabled={!pagination!.hasNextPage}
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
