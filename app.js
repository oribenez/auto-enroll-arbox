import express from "express";
import dotenv from "dotenv";

import { scheduler } from "./lib/arbox.js";

const app = express();
dotenv.config();

app.use(express.json());

// Setting CORS Headers to every response of the server
app.use((req, res, next) => {
	res.setHeader(
		"Access-Control-Allow-Origin","*"
	); // * => this is the domain
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
	);
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, PATCH, DELETE, OPTIONS"
	);
	next();
});

// Initiate Arbox scheduler
await scheduler(); 

app.get("/", async (req, res, next) => {
	console.log("Health check 🩸🧬");
	
	const healthcheck = {
		uptime: process.uptime(),
		message: "OK",
		timestamp: Date.now(),
	};
	try {
		console.log(healthcheck);
		res.status(200).send(healthcheck);
	} catch (error) {
		healthcheck.message = error;
		res.status(503).send();
	}
});

app.use((error, req, res, next) => {
	if (res.headerSent) {
		return next(error);
	}
	res.status(error.code || 500);
	res.json({ message: error.message || "An unknown error occured!" });
});

// listen to requests
app.listen(5000);