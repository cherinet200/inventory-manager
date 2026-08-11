import type { Request, Response } from "express";
import prisma from "../db.ts";

export const sellProduct = async (req: Request, res: Response) => {
    !req.body && res.status(400).json({ message: "Invalid input!" });
    if (
        typeof req.body.productId !== "number" ||
        typeof req.body.quantity !== "number" ||
        typeof req.body.price !== "number" ||
        typeof req.body.total !== "number"
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
        res.json({
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
    try {
        const sales = await prisma.sale.findMany({
            where: {
                product: {
                    userId: req.user!.id,
                },
            },
            take: 10,
        });
        res.json(sales);
    } catch (err) {
        res.status(500).json({ message: "Couldn't get sales" });
        console.error(err);
    }
};
