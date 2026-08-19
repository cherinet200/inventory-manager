import { createFileRoute } from "@tanstack/react-router";
import { Chart } from "@tanstack/charts/react";
import { barY, defineChart } from "@tanstack/charts";
import { scaleBand, scaleLinear, scaleOrdinal } from "d3-scale";
import { tooltip } from "@tanstack/charts/tooltip";
import { useMemo } from "react";
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
import { index } from "d3-array";

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

const sales: StatCard[] = [
    {
        label: "Sales",
        value: `$832`,
        icon: ShoppingCart,
        iconBg: "bg-blue-400/15",
        iconColor: "text-blue-400",
    },
    {
        label: "Revenue",
        value: `$18,300`,
        icon: TrendingUp,
        iconBg: "bg-indigo-500/15",
        iconColor: "text-indigo-500",
    },
    {
        label: "Cost",
        value: `$17,432`,
        icon: CircleDollarSign,
        iconBg: "bg-orange-400/10",
        iconColor: "text-orange-400",
    },
    {
        label: "Profit",
        value: `$868`,
        icon: ChartNoAxesCombined,
        iconBg: "bg-green-400/15",
        iconColor: "text-green-400",
    },
];

const purchase: StatCard[] = [
    {
        label: "Purchase",
        value: `$82`,
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
        label: "Return Expected",
        value: `$17,432`,
        icon: ChartNoAxesCombined,
        iconBg: "bg-green-400/15",
        iconColor: "text-green-400",
    },
];

const TopSelling = [
    {
        name: "Red Bull",
        sold: 10,
        remaining: 20,
        price: `$100`,
    },
    {
        name: "Coca Cola",
        sold: 10,
        remaining: 20,
        price: `$100`,
    },
    {
        name: "Food",
        sold: 10,
        remaining: 20,
        price: `$100`,
    },
];

const LowQuantity = [
    {
        name: "Red Bull",
        remaining: "10 Packet",
    },
    {
        name: "Coca Cola",
        remaining: "20 Packet",
    },
    {
        name: "Food",
        remaining: "5 Packet",
    },
];

export default function Dashboard() {
    return (
        <div className="flex gap-8 m-8">
            <div className="flex flex-col w-[70%] gap-4">
                <Overview overview={sales} view="Sales" />
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
        <div className="flex flex-col py-4 bg-white dark:bg-gray-950 rounded-md ">
            <section className="w-full max-w-4xl px-5 py-5">
                <h2 className="mb-8 text-[20px] font-medium font-playfair">
                    {view} Overview
                </h2>

                <div className="flex items-center">
                    {overview.map((overview, index) => {
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

                                    <span className="text-[20px] font-normal text-slate-500 dark:text-slate-500">
                                        {overview.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

const TopSellingStock = () => {
    return (
        <div className="flex flex-col py-4 bg-white dark:bg-gray-950 rounded-md overflow-x-auto">
            <section className="w-full px-5">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-[20px] font-medium font-playfair">
                        Top Selling Stock
                    </h2>
                    <button className="py-2 px-4 text-blue-600 hover:bg-blue-600/25 rounded-2xl">
                        See All
                    </button>
                </div>
            </section>
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
                    {TopSelling.map((product, index) => (
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
        </div>
    );
};

const LowQuantityStock = () => {
    return (
        <div className="flex flex-col py-4 bg-white dark:bg-gray-950 rounded-md ">
            <section className="w-full px-5 py-5">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-[20px] font-medium font-playfair">
                        Low Quantity Stock
                    </h2>
                    <button className="py-2 px-4 text-blue-600 hover:bg-blue-600/25 rounded-2xl">
                        See All
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    {LowQuantity.map((product, index) => (
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <div className="text-gray-300 font-bold">
                                    {product.name}
                                </div>
                                <div className="text-gray-400">
                                    Remaining Quantity: {product.remaining}
                                </div>
                            </div>
                            <div className="px-2 py-0.5 rounded-2xl bg-red-800/25 text-red-800">
                                Low
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

const ProductSummary = () => {
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
                <div className="flex flex-col gap-1 pr-10 items-center">
                    <div className="flex justify-between gap-15">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-green-500/15">
                            <Boxes className="text-green-500" />
                        </div>
                        <span>100</span>
                    </div>
                    <span>Number of Products</span>
                </div>
                <div className="flex flex-col gap-1 pl-10 items-center">
                    <div className="flex items-center gap-15">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-indigo-500/15">
                            <Tags className="text-indigo-500" />
                        </div>
                        <span>10</span>
                    </div>
                    <span>Number of Products</span>
                </div>
            </div>
        </div>
    );
};
