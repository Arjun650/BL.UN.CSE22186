import express from 'express'
import cors from 'cors'
import stockRoutes from './routes/stockRoutes.js';
import correlationRoutes from './routes/correlationRoutes.js';


const app = express(); 
const PORT = process.env.PORT || 3001; 


app.use(cors())
app.use(express.json())

app.use('/stocks', stockRoutes); 
app.use('/stockcorrelation', correlationRoutes)


app.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}`)
})