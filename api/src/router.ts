import { Router } from "express";
import {
    getProducts,
    createProduct,
    editProduct,
    deleteProduct,
} from "./handler/products.ts";

const router = Router();

router.get("/getProducts", getProducts);
router.post("/createProduct", createProduct);
router.put("/editProduct/:id", editProduct);
router.delete("/deleteProduct/:id", deleteProduct);

export default router;
