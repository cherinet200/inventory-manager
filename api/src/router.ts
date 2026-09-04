import { Router } from "express";
import {
    getProducts,
    createProduct,
    editProduct,
    deleteProduct,
} from "./handler/products.js";
import { deleteSales, getSales, sellProduct } from "./handler/sales.js";
import {
    getLowStocks,
    getProductSummary,
    getSalesOverview,
    getTopSelling,
} from "./handler/dashboard.js";
import { logOut } from "./handler/users.js";

const router = Router();

router.get("/getProducts", getProducts);
router.post("/createProduct", createProduct);
router.put("/editProduct/:id", editProduct);
router.post("/sellProduct", sellProduct);
router.delete("/deleteProduct", deleteProduct);

router.get("/sales", getSales);
router.delete("/deleteSales", deleteSales);

router.get("/getLowStocks", getLowStocks);
router.get("/getProductSummary", getProductSummary);
router.get("/getTopSelling", getTopSelling);
router.get("/getSalesOverview", getSalesOverview);

router.post("/logout", logOut);

router.all("/*splat", (req, res) => {
    res.status(404).json({ message: "Route not found!" });
});

export default router;
