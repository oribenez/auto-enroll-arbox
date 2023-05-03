import express from 'express';

import { getShippings } from '../controllers/shippings-controller.js';

const router = express.Router();

router.get('/shippings', getShippings);

export default router;
