import prisma from "../db.js";
import type { Request, Response } from "express";

interface Product {
    id: number;
    name: string;
    category: string;
    buyingprice: number;
    sellingprice: number;
    quantity: number;
    unit: string;
    expirydate: Date;
    threshold: number;
    deletedAt: Date | null;
    userId: string;
}

export const getLowStocks = async (req: Request, res: Response) => {
    const products = await prisma.$queryRaw<Product[]>`
  SELECT *
  FROM "Product"
  WHERE "quantity" <= "threshold"
    AND "deletedAt" IS NULL
    AND "userId" = ${req.user!.id}
  ORDER BY "quantity" ASC
  LIMIT 3
`;

    return res.json(products);
};

export const getProductSummary = async (req: Request, res: Response) => {
    const [products, categories] = await Promise.all([
        prisma.product.count({
            where: {
                userId: req.user!.id,
                deletedAt: null,
            },
        }),

        prisma.product.groupBy({
            by: ["category"],
            where: {
                userId: req.user!.id,
                deletedAt: null,
            },
        }),
    ]);

    return res.json({ products, categories: categories.length });
};

export const getTopSelling = async (req: Request, res: Response) => {
    const topSelling = await prisma.sale.groupBy({
        by: ["productId"],
        where: {
            product: {
                userId: req.user!.id,
            },
        },
        _sum: {
            quantity: true,
            total: true,
        },
        orderBy: [
            {
                _sum: {
                    quantity: "desc",
                },
            },
            {
                productId: "asc",
            },
        ],
        take: 3,
    });

    const productIds = topSelling.map((sale: any) => sale.productId);

    const products = await prisma.product.findMany({
        where: {
            id: {
                in: productIds,
            },
            userId: req.user!.id,
        },
        select: {
            id: true,
            name: true,
            quantity: true,
        },
        take: 3,
    });

    const topSellingProducts = topSelling.map((sale: any) => {
        const product = products.find(
            (product: any) => product.id === sale.productId,
        );

        return {
            name: product?.name,
            sold: sale._sum.quantity,
            remaining: product?.quantity,
            price: sale._sum.total,
        };
    });

    return res.json({
        topSellingProducts,
    });
};

export const getSalesOverview = async (req: Request, res: Response) => {
    const [sales, revenues] = await Promise.all([
        prisma.sale.count({
            where: {
                product: {
                    userId: req.user!.id,
                },
            },
        }),

        prisma.sale.aggregate({
            where: {
                product: {
                    userId: req.user!.id,
                },
            },

            _sum: {
                quantity: true,
                total: true,
                cost: true,
            },
        }),
    ]);

    const revenue = revenues._sum.total ? revenues._sum.total : 0;
    const cost = revenues._sum.cost ? revenues._sum.cost : 0;

    const profit = revenue - cost;

    return res.json({ sales, revenue, cost, profit });
};
