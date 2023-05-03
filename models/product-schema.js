import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
	name: { type: String, required: true },
	description: String,
	imgUrl: { type: String, default: 'no_photo.jpg' },
	variant: Array,
	price: Number,
});

export default mongoose.model('Product', productSchema);
