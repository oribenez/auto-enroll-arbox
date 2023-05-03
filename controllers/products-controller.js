import HttpError from '../models/http-error.js';
import Product from '../models/product-schema.js';

const getProducts = async (req, res, next) => {
	let products;
	try {
		products = await Product.find().exec();
	} catch (error) {
		return next(new HttpError('get all products failed.', 500));
	}

	res.json({ products });
};

const createProduct = async (req, res, next) => {
	const { name, description, imgUrl, variant, price } = req.body;

	const createdProduct = new Product({
		name,
		description,
		imgUrl,
		variant,
		price,
	});

	try {
		await createdProduct.save();
	} catch (err) {
		return next(
			new HttpError('Creating product failed, please try again.', 500)
		);
	}

	res.status(201).json({ product: createdProduct });
};

export { createProduct, getProducts };
