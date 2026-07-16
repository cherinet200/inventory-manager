import prisma from "../db.ts";
import type { Request, Response } from "express";

interface SortQuery {
    sortBy?: "id" | "sellingprice" | "quantity" | "expirydate";
    order?: "asc" | "desc";
}

const ALLOWED_SORT_FIELDS = ["id", "sellingprice", "quantity", "expirydate"];

export const getProducts = async (
    req: Request<{}, {}, {}, SortQuery>,
    res: Response,
) => {
    let sortBy = req.query.sortBy || "id";
    let order = req.query.order || "desc";

    if (!ALLOWED_SORT_FIELDS.includes(sortBy)) sortBy = "id";
    if (order !== "asc" && order !== "desc") order = "desc";

    const products = await prisma.product.findMany({
        where: {
            userId: req.user!.id,
        },
        orderBy: {
            [sortBy]: order,
        },
    });

    res.status(200).json(products);
};

export const createProduct = async (req: Request, res: Response) => {
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
    await prisma.product.create({
        data: {
            name: req.body.name,
            category: req.body.category,
            buyingprice: req.body.buyingprice,
            sellingprice: req.body.sellingprice,
            quantity: req.body.quantity,
            unit: req.body.unit,
            expirydate: req.body.expirydate,
            threshold: req.body.threshold,
            userId: req.user!.id,
        },
    });

    res.status(201).json({ message: "Product created successsfully!" });
};

export const deleteProduct = async (req: Request, res: Response) => {
    const id = +req.params.id;
    if (!id) return res.status(400).json({ message: "Invalid product ID!" });

    try {
        await prisma.product.delete({
            where: {
                id: id,
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
        await prisma.product.update({
            where: {
                id: id,
            },
            data: req.body,
        });

        res.json({
            message: `Product #${id} is edited successfully!`,
        });
    } catch (err) {
        res.status(400).json({ message: "Invalid product ID!", err });
    }
};
