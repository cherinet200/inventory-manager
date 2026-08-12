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
    direction?: "forward" | "backward";
}

const MAX_LIMIT = 30;
const ALLOWED_SORT_FIELDS = ["id", "sellingprice", "quantity", "expirydate"];

export const getProducts = async (
    req: Request<{}, {}, {}, SortQuery>,
    res: Response,
) => {
    let {
        sortBy = "id",
        order = "desc",
        search = "",
        category = undefined,
        minprice = undefined,
        maxprice = undefined,
        minquantity = undefined,
        maxquantity = undefined,
        limit = 5,
        cursor = undefined,
        direction = "forward",
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

        const isBackward = direction === "backward";

        const products = await prisma.product.findMany({
            where,
            orderBy: [
                {
                    [sortBy]: order,
                },
                {
                    id: order,
                },
            ],
            take: isBackward ? -(Number(limit) + 1) : Number(limit) + 1,
            cursor: cursor ? { id: Number(cursor) } : undefined,
            skip: cursor ? 1 : 0,
        });

        let hasNextPage = false;
        let hasPreviousPage = false;

        if (direction !== "backward") {
            hasNextPage = products.length > Number(limit);
            if (hasNextPage) products.pop();
        }

        const nextCursor = hasNextPage ? products[Number(limit) - 1].id : null;
        res.status(200).json({
            success: true,
            products,
            hasPreviousPage,
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
        !req.body.productname ||
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
        const { productname, ...rest } = req.body;
        const productData = { name: productname, ...rest };

        productData.expirydate = new Date(productData.expirydate);
        const product = await prisma.product.create({
            data: { ...productData, userId: req.user!.id },
        });

        res.status(201).json({
            success: true,
            message: "Product created successsfully!",
            product,
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: "Couldn't create product" });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
        return res.status(400).json({ message: "Invalid product ID!" });

    const productIds = ids.map(Number);

    try {
        const product = await prisma.product.findMany({
            where: {
                id: { in: productIds },
                userId: req.user!.id,
                deletedAt: null,
            },
        });
        if (!product)
            return res.status(404).json({ message: "Product not found!" });

        const sale = await prisma.sale.findMany({
            where: {
                productId: {
                    in: productIds,
                },
            },
        });

        if (!sale[0]) {
            await prisma.product.deleteMany({
                where: {
                    id: {
                        in: productIds,
                    },
                    userId: req.user!.id,
                },
            });

            return res.json({
                success: true,
                message: `Product #${productIds} are deleted successfully!`,
            });
        }

        await prisma.product.updateMany({
            where: {
                id: {
                    in: productIds,
                },
                userId: req.user!.id,
            },
            data: {
                deletedAt: new Date(),
            },
        });

        res.json({
            success: true,
            message: `Product #${productIds} are deleted successfully!`,
        });
    } catch (err) {
        res.status(400).json({ message: "Invalid product ID!", err });
    }
};

export const editProduct = async (req: Request, res: Response) => {
    const id = +req.params.id;
    if (!id) return res.status(400).json({ message: "Invalid product ID!" });
    const { productname, expirydate, ...rest } = req.body;
    const productData = {
        name: productname,
        expirydate: new Date(expirydate),
        ...rest,
    };

    try {
        const product = await prisma.product.update({
            where: {
                id: id,
                userId: req.user!.id,
                deletedAt: null,
            },
            data: productData,
        });

        res.json({
            success: true,
            message: `Product #${id} is edited successfully!`,
            product,
        });
    } catch (err) {
        res.status(400).json({ message: "Invalid product ID!" });
        console.error(err);
    }
};
