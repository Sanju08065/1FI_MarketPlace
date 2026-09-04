import { Router } from 'express';
import * as controller from './product.controller';

const router = Router();

// GET /api/v1/products
router.get('/', controller.listProducts);

// GET /api/v1/products/:slug
router.get('/:slug', controller.getProduct);

// GET /api/v1/products/:slug/emi?variantId=
router.get('/:slug/emi', controller.getProductEmi);

export default router;
