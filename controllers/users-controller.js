import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import HttpError from "../models/http-error.js";
import User from "../models/user-schema.js";

export const getUsers = async (req, res, next) => { 
	let users;
	try {
		users = await User.find({}, "-password"); //    exclude password field from users
	} catch (error) {
		return next(
			new HttpError("Fetching users failed, please try again later.", 500)
		);
	}

	res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const getUserByEmail = async (req, res, next) => {
	const { email } = req.body;

	let user;
	try {
		user = await User.findOne({ email: email });
		if (!user) return next(new HttpError("User not found", 500));
	} catch (error) {
		return next(
			new HttpError("Get user by email failed, please try again later.", 500)
		);
	}

	res.json({ user: user });
};

export const login = async (req, res, next) => {
	const { email, password } = req.body;
	//  Check if user exists
	let existingUser;
	try {
		existingUser = await User.findOne({ email: email });
	} catch (error) {
		const err = new HttpError(
			"Logging in failed, please try again later.",
			500
		);
		return next(err);
	}

	if (!existingUser) {
		// User does not exists
		const err = new HttpError("User does not exist, please sign up.", 401);
		return next(err);
	}
 
	//  Check if password is correct
	let isValidPassword = false;
	try {
		isValidPassword = await bcrypt.compare(password, existingUser.password);
	} catch (error) {
		const err = new HttpError(
			"Could not log you in, please check your credentials and try again.",
			500
		);
		return next(err);
	}

	if (!isValidPassword) {
		const err = new HttpError(
			"Invalid credentials, could not log you in.",
			401
		);
		return next(err);
	}
     
	//  Create token  
	let token; 
	try {
		token = jwt.sign(
			{ userId: existingUser.id, email: existingUser.email },
			"supersecret_dont_share",
			{ expiresIn: "1h" }
		);
	} catch (error) {
		const err = new HttpError(
			"Signing up failed, please try again later.",
			500
		);
		return next(err);
	}
 
	res.status(200).json({
		userId: existingUser.id,
		email: existingUser.email,
		fullname: existingUser.fullname,
		token: token,
	});
};

export const signup = async (req, res, next) => {
	//  Validate req.body params
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(
			new HttpError("Invalid inputs passed, please check your data.", 422)
		);
	}

	const { fullname, email, password, shippingAddress, phone } = req.body;

	//  Check if user already exists.
	let existingUser;
	try {
		existingUser = await User.findOne({ email: email });
	} catch (error) {
		const err = new HttpError(
			"Signing up failed, please try again later.",
			500
		);
		return next(err);
	}
 
	if (existingUser) {
		const err = new HttpError(
			"User already exists, please login instead.",
			422
		);
		return next(err);
	}  
	 
	// Encrypt password
	let hashedPassword;
	try {
		hashedPassword = await bcrypt.hash(password, 12);
	} catch (error) {
		const err = new HttpError(
			"Signing up failed, please try again later.",
			500
		);
		return next(err);
	}

	//  Create new user
	const createdUser = new User({
		fullname,
		email,
		password: hashedPassword,
		shippingAddress,
		phone,
	});

	try {
		await createdUser.save();
	} catch (error) {
		const err = new HttpError(
			"Signing up failed, please try again later.",
			500
		);
		return next(err);
	}

	//  Create token
	let token;
	try {
		token = jwt.sign(
			{ userId: createdUser.id, email: createdUser.email },
			"supersecret_dont_share",
			{ expiresIn: "1h" }
		);
	} catch (error) {
		const err = new HttpError(
			"Signing up failed, please try again later.",
			500
		);
		return next(err);
	}

	res.status(201).json({
		userId: createdUser.id,
		email: createdUser.email,
		fullname: createdUser.fullname,
		token: token,
	});
};
