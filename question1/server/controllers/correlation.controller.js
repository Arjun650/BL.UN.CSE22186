import {getStockPriceHistory, calculateCorrelation} from '../'

const getStockCorrelation = async(req, res) =>{
    const {minutes, ticker: ticker1} = req.query; 
    const {ticker: ticker2} = req.query; 

    if(!ticker1 || !ticker2 || !minutes){
        return res.status(400).json({
            error: "Missing required query parameters: ticker1, ticker2, minutes"
        })
    }

    try{
        const data1 = await getStockPriceHistory(ticker1, minutes); 
        const data2 = await getStockPriceHistory(ticker2, minutes); 

        const correlation = calculateCorrelation(data1, data2); 

        res.json({
            correlation, 
            stocks: {
                [ticker1]: {
                    averagePrice: getAveragePrice(data1), 
                    priceHistory: data1
                }, 
                [ticker2]: {
                    averagePrice: getAveragePrice(data2), 
                    priceHistory: data2
                }
            }
        }); 
    }
    catch(error){
        res.status(500).json({error: `Error calculating Stock Correlation`})
    }
}; 

export default getStockCorrelation; 