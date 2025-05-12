import express from "express";
const router = express.Router(); 
const stockController = require('../controllers/stock.controller');


router.get('/:ticker', stockController.getStockAveragePrice); 

export default router; 