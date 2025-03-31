import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { request } from 'http';
import mongoose from 'mongoose';
import cors from 'cors';

//ARCHIVOS ROUTES
import employeeRoutes from './routes/employee.routes' ;
import tipRoutes from './routes/tips.routes';


dotenv.config();

//APP
const app = express();
const PORT = process.env.PORT;

app.use(express.json());


const MONGO_URL = `mongodb+srv://${process.env.DB_USER}:${process.env.PASSWORD}@${process.env.HOST}/${process.env.DATABASE}?retryWrites=true&w=majority&appName=${process.env.APP_NAME}`;
async function connectDb() {
    try {
        await mongoose.connect(MONGO_URL)
        console.log('Conectado con mongo Atlas')
    } catch (error) {
        console.error('Error al conectar con mongo',(error as Error).message)
        process.exit(1)
    }
}


connectDb();

app.use(cors());
app.use('/api', employeeRoutes);
app.use('/api', tipRoutes);

app.get('/', (req: Request, res: Response) =>{
    res.send('Servidor Activo')
});




//Servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`)
});



