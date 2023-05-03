import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const userSchema = new mongoose.Schema({
	fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    shippingAddress: String,
    phone: String,
});

userSchema.plugin(uniqueValidator); 

export default mongoose.model('User', userSchema);
