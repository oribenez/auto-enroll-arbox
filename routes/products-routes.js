import express from "express";

import {
	createProduct,
	getProducts,
} from "../controllers/products-controller.js";
import { checkAuth } from "../middleware/check-auth.js"; 

const router = express.Router();

router.get("/", getProducts);
router.post("/create", createProduct);

//	Authorization check
router.use(checkAuth);

export default router;
