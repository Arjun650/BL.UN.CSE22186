import { getAveragePrice, getStockPriceHistory } from "../services/stockService.js";

const getStockAveragePrice = async (req, res) =>{
    const {ticker} = req.params; 
    const {minutes} = req.query; 

    try{
        const data = await getStockPriceHistory(ticker, minutes); 
        const averagePrice = getAveragePrice(data); 

        res.json({
            averageStockPrice: averagePrice, 
            priceHistory: data 
        }); 
    }
    catch(error){
        res.status(500).json({error: 'Error fetching stock price History'})
    }
}; 

export default getStockAveragePrice; 