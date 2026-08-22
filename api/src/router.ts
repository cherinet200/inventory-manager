import { Router } from "express";
import {
    getProducts,
    createProduct,
    editProduct,
    deleteProduct,
    getLowStocks,
    getProductSummary,
    getTopSelling,
} from "./handler/products.ts";
import {
    deleteSales,
    getSales,
    getSalesOverview,
    sellProduct,
} from "./handler/sales.ts";
import { logOut } from "./handler/users.ts";

const router = Router();

router.get("/getProducts", getProducts);
router.post("/createProduct", createProduct);
router.put("/editProduct/:id", editProduct);
router.post("/sellProduct", sellProduct);
router.get("/sales", getSales);
router.delete("/deleteSales", deleteSales);
router.delete("/deleteProduct", deleteProduct);

router.get("/getLowStocks", getLowStocks);
router.get("/getProductSummary", getProductSummary);
router.get("/getTopSelling", getTopSelling);
router.get("/getSalesOverview", getSalesOverview);

router.post("/logout", logOut);

router.all("/*splat", (req, res) => {
    res.status(404).json({ message: "Route not found!" });
});

export default router;
