import express from "express";
import getStockAveragePrice from "../controllers/stockController.js";
const router = express.Router(); 



router.get('/:ticker', getStockAveragePrice);

export default router; 