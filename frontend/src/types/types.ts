export interface User {
    name: string;
    email: string;
}

export interface Product {
    id: number;
    name: string;
    category: string;
    buyingprice: number;
    sellingprice: number;
    quantity: number;
    unit: string;
    expirydate: string;
    threshold: number;
}

export interface FormData {
    productname: string;
    category: string;
    buyingprice: number;
    sellingprice: number;
    quantity: number;
    unit: string;
    expirydate: string;
    threshold: number;
}

export interface SalesData {
    productId: number;
    quantity: number;
    price: number;
    total: number;
    cost: number;
}

export interface SalesDatas {
    name: string;
    id: number;
    productId: number;
    quantity: number;
    price: number;
    total: number;
}

export interface Pagination {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
    page: number;
    total: number;
    totalPages: number;
}
