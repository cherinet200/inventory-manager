import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
    ShoppingCart,
    TrendingUp,
    ChartNoAxesCombined,
    ShoppingBag,
    LucideIcon,
    CircleDollarSign,
    Tags,
    Boxes,
} from "lucide-react";
import { Td, Th } from "../components/table";
import { Product } from "../types/types";

export const Route = createFileRoute("/_auth/dashboard/")({
    component: Dashboard,
});

interface StatCard {
    label: string;
    value: string;
    icon: LucideIcon;
    iconBg: string;
    iconColor: string;
}

interface OverviewComponent {
    view: string;
    overview: StatCard[];
}

interface ProductSummaryData {
    products: number;
    categories: number;
}

interface TopSellingProducts {
    name: string;
    sold: number;
    remaining: number;
    price: number;
}

const purchase: StatCard[] = [
    {
        label: "Purchase",
        value: `82`,
        icon: ShoppingBag,
        iconBg: "bg-blue-400/15",
        iconColor: "text-blue-400",
    },
    {
        label: "Cost",
        value: `$13,573`,
        icon: CircleDollarSign,
        iconBg: "bg-orange-400/10",
        iconColor: "text-orange-400",
    },
    {
        label: "Revenue",
        value: `$17,432`,
        icon: TrendingUp,
        iconBg: "bg-indigo-500/15",
        iconColor: "text-indigo-500",
    },
    {
        label: "Profit",
        value: `$17,432`,
        icon: ChartNoAxesCombined,
        iconBg: "bg-green-400/15",
        iconColor: "text-green-400",
    },
];

export default function Dashboard() {
    const [sales, setSales] = useState<StatCard[] | null>(null);
    useEffect(() => {
        const fetchSalesOverview = async () => {
            const overview = await fetch("/api/getSalesOverview", {
                credentials: "include",
            });
            const overviewData = await overview.json();

            if (overviewData.shouldRefresh) {
                window.location.reload();
            }

            const salesDetail: StatCard[] = [
                {
                    label: "Sales",
                    value: `${overviewData.sales}`,
                    icon: ShoppingCart,
                    iconBg: "bg-blue-400/15",
                    iconColor: "text-blue-400",
                },
                {
                    label: "Cost",
                    value: `$${overviewData.cost}`,
                    icon: CircleDollarSign,
                    iconBg: "bg-orange-400/10",
                    iconColor: "text-orange-400",
                },
                {
                    label: "Revenue",
                    value: `$${overviewData.revenue}`,
                    icon: TrendingUp,
                    iconBg: "bg-indigo-500/15",
                    iconColor: "text-indigo-500",
                },
                {
                    label: "Profit",
                    value: `$${overviewData.profit}`,
                    icon: ChartNoAxesCombined,
                    iconBg: "bg-green-400/15",
                    iconColor: "text-green-400",
                },
            ];

            setSales(salesDetail);
        };

        fetchSalesOverview();
    }, []);
    return (
        <div className="flex gap-8 m-8">
            <div className="flex flex-col w-[70%] gap-4">
                {sales && <Overview overview={sales} view="Sales" />}
                <Overview overview={purchase} view="Purchase" />
                <TopSellingStock />
            </div>
            <div className="flex flex-col w-[30%] gap-4">
                <ProductSummary />
                <LowQuantityStock />
            </div>
        </div>
    );
}

const Overview = ({ view, overview }: OverviewComponent) => {
    return (
        <div className="flex flex-col bg-white dark:bg-gray-950 rounded-md  px-5 py-6.5">
            <div className="flex items-center justify-between mb-6">
                <section className="w-full max-w-4xl">
                    <h2 className="text-[20px] font-medium font-playfair">
                        {view} Overview
                    </h2>
                </section>
                <select
                    name="time-range"
                    id={`${view}-time-range`}
                    className="border rounded-lg px-3 py-1.5 dark:border-blue-500/50 text-blue-500/80 dark:bg-black"
                >
                    <option value="today">today</option>
                    <option value="yesterday">yesterday</option>
                    <option value="this-week">this week</option>
                    <option value="last-week">last week</option>
                    <option value="this-month">this month</option>
                    <option value="last-month">last month</option>
                    <option value="this year">this year</option>
                    <option value="last year">last year</option>
                </select>
            </div>

            <div className="flex items-center">
                {overview.length > 0 &&
                    overview.map((overview, index) => {
                        const Icon = overview.icon;

                        return (
                            <div
                                key={overview.label}
                                className={`flex items-center justify-center min-w-50 px-2 gap-2  ${
                                    index !== 0
                                        ? "border-l border-slate-100 dark:border-slate-700"
                                        : ""
                                }`}
                            >
                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${overview.iconBg}`}
                                >
                                    <Icon
                                        size={20}
                                        strokeWidth={1.8}
                                        className={overview.iconColor}
                                    />
                                </div>

                                <div className="flex items-baseline gap-5 whitespace-nowrap">
                                    <span className="text-[20px] font-semibold text-slate-600 dark:text-slate-400">
                                        {overview.value}
                                    </span>

                                    <span className="text-[20px] font-normal text-slate-500 ">
                                        {overview.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

const TopSellingStock = () => {
    const [topSelling, setTopSelling] = useState<TopSellingProducts[]>([]);
    useEffect(() => {
        const fetchTopSelling = async () => {
            const res = await fetch("/api/getTopSelling", {
                credentials: "include",
            });
            const data = await res.json();

            if (data.shouldRefresh) {
                window.location.reload();
            }

            setTopSelling(data.topSellingProducts);
        };

        fetchTopSelling();
    }, []);

    return (
        <div className="flex flex-col py-4 bg-white dark:bg-gray-950 rounded-md overflow-x-auto">
            <section className="w-full px-5">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-[20px] font-medium font-playfair">
                        Top Selling Stock
                    </h2>
                    <div className="flex gap-2">
                        <select
                            name="time-range"
                            id="top-selling-time-range"
                            className="border rounded-lg px-3 py-1.5 dark:border-blue-500/50 text-blue-500/80 dark:bg-black"
                        >
                            <option value="today" className="dark:text-white">
                                today
                            </option>
                            <option
                                value="yesterday"
                                className="dark:text-white"
                            >
                                yesterday
                            </option>
                            <option
                                value="this-week"
                                className="dark:text-white"
                            >
                                this week
                            </option>
                            <option
                                value="last-week"
                                className="dark:text-white"
                            >
                                last week
                            </option>
                            <option
                                value="this-month"
                                className="dark:text-white"
                            >
                                this month
                            </option>
                            <option
                                value="last-month"
                                className="dark:text-white"
                            >
                                last month
                            </option>
                            <option
                                value="this year"
                                className="dark:text-white"
                            >
                                this year
                            </option>
                            <option
                                value="last year"
                                className="dark:text-white"
                            >
                                last year
                            </option>
                        </select>
                        <button className="py-2 px-4 text-blue-600 hover:bg-blue-600/25 bg-blue-600/10 rounded-2xl">
                            See All
                        </button>
                    </div>
                </div>
            </section>
            {topSelling && (
                <table className="divide-y divide-gray-100 dark:divide-gray-900">
                    <thead className="bg-white dark:bg-gray-950">
                        <tr className="">
                            <Th>Name</Th>
                            <Th>Sold Quantity</Th>
                            <Th>Remaining Quantity</Th>
                            <Th>Price</Th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                        {topSelling.map((product, index) => (
                            <tr
                                key={index}
                                className="hover:bg-gray-100 dark:hover:bg-gray-900"
                            >
                                <Td>{product.name}</Td>
                                <Td>{product.sold}</Td>
                                <Td>{product.remaining}</Td>
                                <Td>{product.price}</Td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

const LowQuantityStock = () => {
    const [lowQuantity, setLowQuantity] = useState<Product[]>([]);

    useEffect(() => {
        const response = async () => {
            const res = await fetch("/api/getLowStocks", {
                credentials: "include",
            });
            const result = await res.json();

            if (result.shouldRefresh) {
                window.location.reload();
            }

            setLowQuantity(result);
        };

        response();
    }, []);
    return (
        <div className="flex flex-col py-4 bg-white dark:bg-gray-950 rounded-md ">
            <section className="w-full px-5 py-5">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-[20px] font-medium font-playfair">
                        Low Quantity Stock
                    </h2>
                    {lowQuantity.length > 1 && (
                        <button className="py-2 px-4 text-blue-600 hover:bg-blue-600/25 bg-blue-600/10 rounded-2xl">
                            See All
                        </button>
                    )}
                </div>

                {lowQuantity.length > 1 && (
                    <div className="flex flex-col gap-4">
                        {lowQuantity.map((product, index) => (
                            <div
                                key={index}
                                className="flex justify-between items-center"
                            >
                                <div className="flex flex-col">
                                    <div className="text-gray-300 font-bold">
                                        {product.name}
                                    </div>
                                    <div className="text-gray-400">
                                        Remaining Quantity:{" "}
                                        {product.quantity + " " + product.unit}
                                    </div>
                                </div>
                                <div className="px-2 py-0.5 rounded-2xl bg-red-800/20 text-red-800">
                                    Low
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

const ProductSummary = () => {
    const [productSummary, setProductSummary] = useState<ProductSummaryData>({
        products: 0,
        categories: 0,
    });

    useEffect(() => {
        const response = async () => {
            const res = await fetch("/api/getProductSummary", {
                credentials: "include",
            });
            const result = await res.json();

            if (result.shouldRefresh) {
                window.location.reload();
            }

            setProductSummary(result);
        };

        response();
    }, []);
    return (
        <div className="flex flex-col py-4 px-5 bg-white dark:bg-gray-950 rounded-md overflow-x-auto">
            <section className="w-full">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-[20px] font-medium font-playfair">
                        Product Summary
                    </h2>
                </div>
            </section>
            <div className="flex justify-center divide-x divide-gray-800">
                <div className="flex flex-col gap-1 pr-6 items-center">
                    <div className="flex items-center gap-8">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-green-400/15">
                            <Boxes className="text-green-500" />
                        </div>
                        <span className="dark:text-slate-400 font-semibold text-[20px]">
                            {productSummary.products}
                        </span>
                    </div>
                    <span className="text-[18px] text-slate-500">
                        Number of Products
                    </span>
                </div>
                <div className="flex flex-col gap-1 pl-6 items-center">
                    <div className="flex items-center gap-8">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-indigo-500/15">
                            <Tags className="text-indigo-500" />
                        </div>
                        <span className="dark:text-slate-400 font-semibold text-[20px]">
                            {productSummary.categories}
                        </span>
                    </div>
                    <span className="text-[18px] text-slate-500">
                        Number of Categories
                    </span>
                </div>
            </div>
        </div>
    );
};
