import { Router } from "express";
import {
    getProducts,
    createProduct,
    editProduct,
    deleteProduct,
} from "./handler/products.ts";
import { deleteSales, getSales, sellProduct } from "./handler/sales.ts";
import { logOut } from "./handler/users.ts";

const router = Router();

router.get("/getProducts", getProducts);
router.post("/createProduct", createProduct);
router.put("/editProduct/:id", editProduct);
router.post("/sellProduct", sellProduct);
router.get("/sales", getSales);
router.delete("/deleteSales", deleteSales);
router.delete("/deleteProduct", deleteProduct);

router.post("/logout", logOut);

router.all("/*splat", (req, res) => {
    res.status(404).json({ message: "Route not found!" });
});

export default router;
