import { createContext, useContext, useState } from "react";
import type { Pagination, Product, SalesData } from "../types/types";
import { FormData } from "../types/types";
import { useAuth } from "./auth";

interface QueryType {
    query?: string | undefined;
}

type Visibility = "flex" | "hidden";

interface ProductContextType {
    products: Product[];
    fetchProduct: (query?: QueryType, page?: number) => Promise<void>;
    createProduct: (formData: FormData) => void;
    editProduct: (formData: FormData, productId: number) => void;
    deleteProduct: (productIds: number[]) => void;
    sellProduct: (salesData: SalesData) => void;
    formOpen: Visibility;
    editFormOpen: Visibility;
    salesFormOpen: Visibility;
    searchedPage: boolean;
    setSearchedPage: (to: boolean) => void;
    setFormVisibility: (to: Visibility) => void;
    setEditFormVisibility: (to: Visibility) => void;
    setSalesFormVisibility: (to: Visibility) => void;
    pagination: Pagination | null;
}

const ProductContext = createContext<ProductContextType | null>(null);

export function ProductProvider({ children }: { children: React.ReactNode }) {
    const { logout } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [formOpen, setFormOpen] = useState<Visibility>("hidden");
    const [editFormOpen, setEditFormOpen] = useState<Visibility>("hidden");
    const [salesFormOpen, setSalesFormOpen] = useState<Visibility>("hidden");
    const [searchedPage, setSearchedPage] = useState(false);
    const [pagination, setPagination] = useState<Pagination | null>(null);

    const fetchProduct = async ({ query }: QueryType = {}, page?: number) => {
        const fetchProducts = async () => {
            return await fetch(
                `/api/getProducts?limit=10${query ? `${query}` : ""}${page ? `&page=${page}` : ""}`,
            );
        };
        const res = await fetchProducts();
        const data = await res.json();
        if (res.status === 200) {
            setProducts(data.products);
            setPagination(data.pagination);
        } else if (res.status === 401) {
            const refreshRes = await fetch("/auth/token", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (refreshRes.status === 200) {
                const res = await fetchProducts();
                const data = await res.json();
                setProducts(data.products);
                setPagination(data.pagination);
            } else if (refreshRes.status === 401) {
                logout();
            }
        }
    };

    const createProduct = async (formData: FormData) => {
        const createProducts = async () => {
            return await fetch("/api/createProduct", {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    ...formData,
                }),
            });
        };
        const res = await createProducts();
        if (res.status === 201) await fetchProduct();
        else if (res.status === 401) {
            const refreshRes = await fetch("/auth/token", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (refreshRes.status === 200) {
                await createProducts();
                await fetchProduct();
            } else if (refreshRes.status === 401) {
                logout();
            }
        }
    };

    const editProduct = async (formData: FormData, productId: number) => {
        const editProducts = async () => {
            return await fetch(`/api/editProduct/${productId}`, {
                method: "PUT",
                credentials: "include",
                body: JSON.stringify({
                    ...formData,
                }),
            });
        };
        const res = await editProducts();
        if (res.status === 200) await fetchProduct(undefined, pagination?.page);
        else if (res.status === 401) {
            const refreshRes = await fetch("/auth/token", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (refreshRes.status === 200) {
                await editProducts();
                await fetchProduct(undefined, pagination?.page);
            } else if (refreshRes.status === 401) {
                logout();
            }
        }
    };

    const deleteProduct = async (productIds: number[]) => {
        const deleteProducts = async () => {
            return await fetch("/api/deleteProduct/", {
                method: "DELETE",
                credentials: "include",
                body: JSON.stringify({ ids: productIds }),
            });
        };
        const res = await deleteProducts();
        if (res.status === 200) await fetchProduct(undefined, pagination?.page);
        else if (res.status === 401) {
            const refreshRes = await fetch("/auth/token", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (refreshRes.status === 200) {
                await deleteProducts();
                await fetchProduct(undefined, pagination?.page);
            } else if (refreshRes.status === 401) {
                logout();
            }
        }
    };

    const sellProduct = async (salesData: SalesData) => {
        const sellProducts = async () => {
            return await fetch("/api/sellProduct", {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    ...salesData,
                }),
            });
        };
        const res = await sellProducts();
        if (res.status === 200) await fetchProduct(undefined, pagination?.page);
        else if (res.status === 401) {
            const refreshRes = await fetch("/auth/token", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (refreshRes.status === 200) {
                await sellProducts();
                await fetchProduct(undefined, pagination?.page);
            } else if (refreshRes.status === 401) {
                logout();
            }
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
