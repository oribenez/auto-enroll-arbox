const functions = require("firebase-functions");
const firebaseConfig = functions.config();

export default () => {
	// Porting envs from firebase config
	for (const key in firebaseConfig.config) {
		process.env[key.toUpperCase()] = firebaseConfig.config[key];
	}
};
