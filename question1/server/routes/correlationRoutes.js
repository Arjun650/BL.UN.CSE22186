import express from 'express'
import correlationController from '../controllers/correlationController.js';


const router = express.Router(); 

router.get('/', correlationController.getStockCorrelation); 

export default router; 