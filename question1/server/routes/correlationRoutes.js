import { Router } from 'express';
import  getStockCorrelation  from '../controllers/correlationController.js';  // Add .js extension

const router = Router();

router.get('/', getStockCorrelation);

export default router;
