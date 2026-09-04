import type { Request, Response } from "express";
import prisma from "../db.js";

interface SaleInterface {
    id: number;
    quantity: number;
    price: number;
    cost: number;
    total: string;
    createdAt: string;
    productId: number;
}

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
        const [sales, total] = await prisma.$transaction([
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

        const salesIds = sales.map((sale) => sale.productId);

        const products = await prisma.product.findMany({
            where: {
                id: {
                    in: salesIds,
                },
            },
        });

        const returnSales = sales.map((sale) => {
            const prod = products.filter(
                (product) => product.id === sale.productId,
            );

            const retSale = {
                name: prod[0].name,
                ...sale,
            };

            return retSale;
        });

        res.json({
            sales: returnSales,
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
    const sales: SaleInterface[] = req.body.sales;
    if (!Array.isArray(ids) || ids.length === 0)
        return res.status(400).json({ message: "Invalid sales ID!" });

    const salesIds = ids.map(Number);

    const salesE = await prisma.sale.findMany({
        where: {
            product: {
                userId: req.user!.id,
            },
        },
    });

    if (!salesE[0])
        return res.status(400).json({ message: "Sales record doesn't exist." });

    prisma.sale.deleteMany({
        where: {
            product: {
                userId: req.user!.id,
            },
            id: {
                in: salesIds,
            },
        },
    });

    await prisma.$transaction([
        ...sales.map((sale) =>
            prisma.product.update({
                where: {
                    userId: req.user!.id,
                    id: sale.productId,
                },
                data: {
                    quantity: {
                        increment: sale.quantity,
                    },
                },
            }),
        ),
        prisma.sale.deleteMany({
            where: {
                product: {
                    userId: req.user!.id,
                },
                id: {
                    in: salesIds,
                },
            },
        }),
    ]);

    res.json({ message: "Deleted successfully!" });
};
