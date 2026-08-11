import { Router } from "express";
import {
    getProducts,
    createProduct,
    editProduct,
    deleteProduct,
} from "./handler/products.ts";
import { getSales, sellProduct } from "./handler/sells.ts";
import { dashboard } from "./handler/dashboard.ts";

const router = Router();

router.get("/getProducts", getProducts);
router.post("/createProduct", createProduct);
router.put("/editProduct/:id", editProduct);
router.post("/sellProduct", sellProduct);
router.get("/sales", getSales);
router.delete("/deleteProduct/:id", deleteProduct);

router.all("/*splat", (req, res) => {
    res.status(404).json({ message: "Route not found!" });
});

export default router;
