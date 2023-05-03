import jwt from "jsonwebtoken";

import HttpError from "../models/http-error.js";

export const checkAuth = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }
	try {
		const token = req.headers.authorization.split(" ")[1]; // Authorization: 'Bearer TOKEN'
		if (!token) {
			const err = new HttpError("Authentication failed!", 401);
			return next(error);
		}

		const decodedToken = jwt.verify(token, "supersecret_dont_share");
		req.userData = { userId: decodedToken.userId };
		next();
	} catch (error) {
		const err = new HttpError("Authentication failed!", 401);
		return next(error);
	}
};

