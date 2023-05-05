import functions from "firebase-functions";
const firebaseConfig = functions.config();

export const firebaseVarsPorting = () => {
	// Porting envs from firebase config
	for (const key in firebaseConfig.config) {
		process.env[key.toUpperCase()] = firebaseConfig.config[key];
	}
};
