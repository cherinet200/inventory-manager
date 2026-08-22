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
    page?: number;
    cursor?: number;
    direction?: "forward" | "backward";
}

export interface Product {
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
    } = { ...req.query };
    const limit = Math.min(Number(req.query.limit) || 10, MAX_LIMIT);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    if (!ALLOWED_SORT_FIELDS.includes(sortBy)) sortBy = "id";
    if (order !== "asc" && order !== "desc") order = "asc";

    try {
        const where: any = {
            userId: req.user!.id,
            name: { contains: search, mode: "insensitive" },
            category: category !== undefined ? category : undefined,
            deletedAt: null,
        };

        if (minprice !== undefined || maxprice !== undefined) {
            where.sellingprice = {};

            minprice !== undefined &&
                (where.sellingprice.gte = Number(minprice));
            maxprice !== undefined &&
                (where.sellingprice.lte = Number(maxprice));
        }

        if (minquantity !== undefined || maxquantity !== undefined) {
            where.quantity = {};

            minquantity !== undefined &&
                (where.quantity.gte = Number(minquantity));
            maxquantity !== undefined &&
                (where.quantity.lte = Number(maxquantity));
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy: [
                    {
                        [sortBy]: order,
                    },
                    {
                        id: order,
                    },
                ],
                skip,
                take: limit,
            }),

            prisma.product.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);
        const hasPreviousPage = page > 1;
        const hasNextPage = page < totalPages;

        res.status(200).json({
            success: true,
            products,
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

    const productIds = topSelling.map((sale) => sale.productId);

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

    const topSellingProducts = topSelling.map((sale) => {
        const product = products.find(
            (product) => product.id === sale.productId,
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
