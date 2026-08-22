import type { Request, Response } from "express";
import prisma from "../db.ts";

export const sellProduct = async (req: Request, res: Response) => {
    !req.body && res.status(400).json({ message: "Invalid input!" });
    if (
        typeof req.body.productId !== "number" ||
        typeof req.body.quantity !== "number" ||
        typeof req.body.price !== "number" ||
        typeof req.body.total !== "number" ||
        typeof req.body.cost !== "number"
    ) {
        res.status(400).json({ message: "Invalid input!" });
    }

    try {
        const { productId, quantity } = req.body;

        const product = await prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product)
            return res.status(400).json({ message: "Product not available!" });
        if (product.quantity < quantity)
            return res.status(400).json({ message: "Stock insufficient!" });

        const [updatedProduct, sale] = await prisma.$transaction([
            prisma.product.update({
                where: { id: productId },
                data: {
                    quantity: {
                        decrement: quantity,
                    },
                },
            }),

            prisma.sale.create({
                data: req.body,
            }),
        ]);
        res.status(200).json({
            message: "Product sold successfully!",
            sale,
            updatedProduct,
        });
    } catch (err) {
        res.json({ message: "Couldn't sale product" });
        console.error(err);
    }
};

export const getSales = async (req: Request, res: Response) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    try {
        const [sales, total] = await Promise.all([
            prisma.sale.findMany({
                where: {
                    product: {
                        userId: req.user!.id,
                    },
                },
                orderBy: {
                    id: "desc",
                },
                skip,
                take: limit,
            }),

            prisma.sale.count({
                where: {
                    product: {
                        userId: req.user!.id,
                    },
                },
            }),
        ]);

        const totalPages = Math.ceil(total / limit);
        const hasPreviousPage = page > 1;
        const hasNextPage = page < totalPages;

        res.json({
            sales,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasPreviousPage,
                hasNextPage,
            },
        });
    } catch (err) {
        res.status(400).json({ message: "Couldn't get sales" });
        console.error(err);
    }
};

export const deleteSales = async (req: Request, res: Response) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
        return res.status(400).json({ message: "Invalid sales ID!" });

    const salesIds = ids.map(Number);

    const products = await prisma.sale.findMany({
        where: {
            product: {
                userId: req.user!.id,
            },
        },
    });

    if (!products[0])
        return res.status(400).json({ message: "Sales record doesn't exist." });

    await prisma.sale.deleteMany({
        where: {
            product: {
                userId: req.user!.id,
            },
            id: {
                in: salesIds,
            },
        },
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
