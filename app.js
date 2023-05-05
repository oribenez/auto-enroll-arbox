import express from "express";
import dotenv from "dotenv";
import functions from "firebase-functions";

import { scheduler } from "./lib/arbox.js";

const app = express();
dotenv.config();

app.use(express.json());

// Setting CORS Headers to every response of the server
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL.toString()); // * => this is the domain
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
	);
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
	next();
});
await scheduler();

app.use((error, req, res, next) => {
	if (res.headerSent) {
		return next(error);
	}
	res.status(error.code || 500);
	res.json({ message: error.message || "An unknown error occured!" });
});


// listen to requests
// app.listen(process.env.PORT || 5000);

export const api = functions.https.onRequest(app);