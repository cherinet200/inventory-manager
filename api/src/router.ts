import { Router } from "express";
import {
    getProducts,
    createProduct,
    editProduct,
    deleteProduct,
} from "./handler/products.ts";
import { sellProduct } from "./handler/sells.ts";

const router = Router();

router.get("/getProducts", getProducts);
router.post("/createProduct", createProduct);
router.put("/editProduct/:id", editProduct);
router.post("/sellProduct", sellProduct);
router.delete("/deleteProduct/:id", deleteProduct);

export default router;
