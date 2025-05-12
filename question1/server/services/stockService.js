import axios from "axios";
import dotenv from 'dotenv'; 
dotenv.config();

const getStockPriceHistory = async (ticker, minutes) => {
    console.log(`Fetching price history for ${ticker} with ${minutes} minutes`);

    try {
        const response = await axios.get(
            `${process.env.API_BASE_URL}/stocks/${ticker}?minutes=${minutes}`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.API_TOKEN}`,
                    // 'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('API Base URL:', process.env.API_BASE_URL);
        console.log('Stock price history response:', response.data);
        
        return response.data;
    } catch (error) {
        console.error(`Error fetching stock price history for ${ticker}:`, error.message);

        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }

        throw new Error(`Failed to fetch price history for ${ticker}: ${error.message}`);
    }
};


const getAveragePrice = (data) => {
    const prices = data.map((entry) => entry.price); 
    const sum = prices.reduce((acc, price) => acc + price, 0); 
    return sum / prices.length; 
};

export { getStockPriceHistory, getAveragePrice };
