import mongoose from 'mongoose';

const shippingSchema = new mongoose.Schema({
	name: String,
	description: String,
	price: Number,
});

export default mongoose.model('Shipping', shippingSchema);
