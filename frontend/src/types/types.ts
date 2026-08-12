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
}
