import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
	items: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Product' }],
	selectedShipping: {
		type: mongoose.Types.ObjectId,
		required: true,
		ref: 'Shipping',
	},
	guestPayment: {
		isGuestPaymentActive: Boolean,
		fullname: String,
		email: String,
		phone: String,
	},
	client: mongoose.Types.ObjectId,
});

export default mongoose.model('Order', orderSchema);
