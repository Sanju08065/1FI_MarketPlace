import { Router } from 'express';
import { serveImage, serveImageByKey } from './image.controller';

const router = Router();

// GET /api/v1/images/by-key/:key  (registered before /:id)
router.get('/by-key/:key', serveImageByKey);

// GET /api/v1/images/:id
router.get('/:id', serveImage);

export default router;
