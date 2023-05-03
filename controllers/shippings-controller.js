import HttpError from '../models/http-error.js';
import Shipping from '../models/shipping-schema.js';

const getShippings = async (req, res, next) => {
	let shippings;
	try {
		shippings = await Shipping.find().exec();
	} catch (error) {
		return next(new HttpError('get all shippings failed', 500));
	}
	res.json(shippings);
};

export { getShippings };
