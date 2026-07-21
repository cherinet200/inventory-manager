import prisma from "../db.ts";
import type { Request, Response } from "express";

interface SortQuery {
    sortBy?: "id" | "sellingprice" | "quantity" | "expirydate";
    order?: "asc" | "desc";
    search?: string;
    category?: string;
    minprice?: number;
    maxprice?: number;
    minquantity?: number;
    maxquantity?: number;
    limit?: number;
    cursor?: number;
}

const MAX_LIMIT = 30;
const ALLOWED_SORT_FIELDS = ["id", "sellingprice", "quantity", "expirydate"];

export const getProducts = async (
    req: Request<{}, {}, {}, SortQuery>,
    res: Response,
) => {
    let {
        sortBy = "id",
        order = "asc",
        search = "",
        category = undefined,
        minprice = undefined,
        maxprice = undefined,
        minquantity = undefined,
        maxquantity = undefined,
        limit = 5,
        cursor = undefined,
    } = { ...req.query };

    if (!ALLOWED_SORT_FIELDS.includes(sortBy)) sortBy = "id";
    if (order !== "asc" && order !== "desc") order = "asc";
    if (limit > MAX_LIMIT) limit = 30;

    try {
        const where: any = {
            userId: req.user!.id,
            name: { contains: search, mode: "insensitive" },
            category: category,
            deletedAt: null,
        };

        if (minprice || maxprice) {
            where.sellingprice = {};

            minprice && (where.sellingprice.gte = Number(minprice));
            maxprice && (where.sellingprice.lte = Number(maxprice));
        }

        if (minquantity || maxquantity) {
            where.quantity = {};

            minquantity && (where.quantity.gte = Number(minquantity));
            maxquantity && (where.quantity.lte = Number(maxquantity));
        }

        const products = await prisma.product.findMany({
            where,
            orderBy: {
                [sortBy]: order,
            },
            take: Number(limit) + 1,
            cursor: cursor ? { id: Number(cursor) } : undefined,
            skip: cursor ? 1 : 0,
        });

        const hasNextPage = products.length > Number(limit);
        if (hasNextPage) products.pop();

        const nextCursor = hasNextPage ? products[Number(limit) - 1].id : null;

        res.status(200).json({
            products,
            hasNextPage,
            nextCursor,
        });
    } catch (err) {
        res.status(400).json({ message: "Couldn't get products", err });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    !req.body && res.status(400).json({ message: "Invalid input!" });
    if (
        !req.body.name ||
        !req.body.category ||
        !req.body.buyingprice ||
        !req.body.sellingprice ||
        !req.body.quantity ||
        !req.body.unit ||
        !req.body.expirydate ||
        !req.body.threshold
    ) {
        return res.status(400).json({ message: "Invalid input!" });
    }
    try {
        const product = await prisma.product.create({
            data: { ...req.body, userId: req.user!.id },
        });

        res.status(201).json({
            message: "Product created successsfully!",
            product,
        });
    } catch (err) {
        res.status(400).json({ message: "Couldn't create product", err });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    const id = +req.params.id;
    if (!id) return res.status(400).json({ message: "Invalid product ID!" });

    try {
        const product = await prisma.sale.findUnique({
            where: {
                id: id,
                userId: req.user!.id,
            },
        });
        if (!product)
            return res.status(404).json({ message: "Product not found!" });

        const sale = await prisma.sale.findMany({
            where: {
                productId: id,
            },
        });

        if (!sale) {
            await prisma.product.delete({
                where: {
                    id: id,
                    userId: req.user!.id,
                },
            });

            return res.json({
                message: `Product #${id} is deleted successfully!`,
            });
        }

        await prisma.product.update({
            where: {
                id: id,
                userId: req.user!.id,
            },
            data: {
                deletedAt: new Date(),
            },
        });

        res.json({
            message: `Product #${id} is deleted successfully!`,
        });
    } catch (err) {
        res.status(400).json({ message: "Invalid product ID!", err });
    }
};

export const editProduct = async (req: Request, res: Response) => {
    const id = +req.params.id;
    if (!id) return res.status(400).json({ message: "Invalid product ID!" });

    try {
        const product = await prisma.product.update({
            where: {
                id: id,
                userId: req.user!.id,
            },
            data: req.body,
        });

        res.json({
            message: `Product #${id} is edited successfully!`,
            product,
        });
    } catch (err) {
        res.status(400).json({ message: "Invalid product ID!", err });
    }
};
