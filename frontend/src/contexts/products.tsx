import { createContext, useContext, useState } from "react";
import type { Pagination, Product, SalesData } from "../types/types";
import { FormData } from "../types/types";
import { toast } from "sonner";

interface QueryType {
    query?: string | undefined;
}

type Visibility = "flex" | "hidden";

interface ProductContextType {
    products: Product[];
    fetchProduct: (query?: QueryType, page?: number) => Promise<void>;
    createProduct: (formData: FormData) => Promise<string>;
    editProduct: (formData: FormData, productId: number) => void;
    deleteProduct: (productIds: number[]) => void;
    sellProduct: (
        salesData: SalesData,
        setSelected: React.Dispatch<React.SetStateAction<number[]>>,
        setFormData: React.Dispatch<React.SetStateAction<SalesData>>,
    ) => void;
    formOpen: Visibility;
    editFormOpen: Visibility;
    salesFormOpen: Visibility;
    searchedPage: boolean;
    setSearchedPage: (to: boolean) => void;
    setFormVisibility: (to: Visibility) => void;
    setEditFormVisibility: (to: Visibility) => void;
    setSalesFormVisibility: (to: Visibility) => void;
    pagination: Pagination | null;
    message: string | null;
}

const ProductContext = createContext<ProductContextType | null>(null);

export function ProductProvider({ children }: { children: React.ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [formOpen, setFormOpen] = useState<Visibility>("hidden");
    const [editFormOpen, setEditFormOpen] = useState<Visibility>("hidden");
    const [salesFormOpen, setSalesFormOpen] = useState<Visibility>("hidden");
    const [searchedPage, setSearchedPage] = useState(false);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const fetchProduct = async ({ query }: QueryType = {}, page?: number) => {
        const fetchProducts = async () => {
            return await fetch(
                `/api/getProducts?limit=10${query ? `${query}` : ""}${page ? `&page=${page}` : ""}`,
            );
        };
        const res = await fetchProducts();
        const data = await res.json();

        if (data.shouldRefresh) {
            window.location.reload();
        }

        if (res.status === 200) {
            setProducts(data.products);
            setPagination(data.pagination);
        }
    };

    const createProduct = async (formData: FormData) => {
        const createProducts = async () => {
            return await fetch("/api/createProduct", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    ...formData,
                }),
            });
        };
        const res = await createProducts();
        const data = await res.json();

        if (data.shouldRefresh) {
            window.location.reload();
        }

        if (res.status === 201) {
            toast.success(data.message);
            await fetchProduct();
            setFormOpen("hidden");
            return "Success";
        } else {
            data.message && toast.error(data.message);
            return "Error";
        }
    };

    const editProduct = async (formData: FormData, productId: number) => {
        const editProducts = async () => {
            return await fetch(`/api/editProduct/${productId}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                }),
            });
        };
        const res = await editProducts();
        const data = await res.json();

        if (data.shouldRefresh) {
            window.location.reload();
        }

        if (res.status === 200) {
            toast.success(data.message);
            await fetchProduct(undefined, pagination?.page);
        } else {
            data.message && toast.error(data.message);
        }
    };

    const deleteProduct = async (productIds: number[]) => {
        const deleteProducts = async () => {
            return await fetch("/api/deleteProduct/", {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ids: productIds }),
            });
        };
        const res = await deleteProducts();
        const data = await res.json();

        if (data.shouldRefresh) {
            window.location.reload();
        }

        if (res.status === 200) {
            toast.success(data.message);
            await fetchProduct(undefined, pagination?.page);
        } else {
            data.message && toast.error(data.message);
        }
    };

    const sellProduct = async (
        salesData: SalesData,
        setSelected: React.Dispatch<React.SetStateAction<number[]>>,
        setFormData: React.Dispatch<React.SetStateAction<SalesData>>,
    ) => {
        const defaultFormData: SalesData = {
            productId: 0,
            quantity: 0,
            price: 0,
            total: 0,
            cost: 0,
        };
        const sellProducts = async () => {
            return await fetch("/api/sellProduct", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...salesData,
                }),
            });
        };
        const res = await sellProducts();
        const data = await res.json();

        if (data.shouldRefresh) {
            window.location.reload();
        }

        if (res.status === 200) {
            toast.success(data.message);
            await fetchProduct(undefined, pagination?.page);
            setSelected([]);
            setFormData(defaultFormData);
            setSalesFormOpen("hidden");

            setMessage("");
        } else if (res.status === 400) {
            toast.error(data.message);
            setSalesFormOpen("flex");
        } else {
            data.message && toast.error(data.message);
        }
    };

    const setFormVisibility = (to: Visibility) => {
        setFormOpen(to);
    };

    const setEditFormVisibility = (to: Visibility) => {
        setEditFormOpen(to);
    };

    const setSalesFormVisibility = (to: Visibility) => {
        setSalesFormOpen(to);
    };

    return (
        <ProductContext.Provider
            value={{
                products,
                fetchProduct,
                createProduct,
                editProduct,
                deleteProduct,
                sellProduct,
                formOpen,
                editFormOpen,
                salesFormOpen,
                searchedPage,
                setSearchedPage,
                setFormVisibility,
                setEditFormVisibility,
                setSalesFormVisibility,
                pagination,
                message,
            }}
        >
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
