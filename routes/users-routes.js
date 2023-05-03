import express from "express";
import { check } from "express-validator";
import { signup, login, getUsers } from "../controllers/users-controller.js";

const router = express.Router();

router.post("/", getUsers);

router.post(
	"/signup",
	[
		check("fullname").not().isEmpty(),
		check("email").normalizeEmail().isEmail(),
		check("password").isLength({ min: 6 }),
		check("shippingAddress").not().isEmpty(),
		check("phone").not().isEmpty(),
	],
	signup
);

router.post("/login", login);

export default router;
