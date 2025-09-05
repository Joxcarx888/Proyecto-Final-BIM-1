'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './mongo.js';
import limiter from '../src/middlewares/validar-cant-peticiones.js';
import authRoutes from '../src/auth/auth.routes.js';
import userRoutes from '../src/users/user.routes.js';
import providerRoutes from '../src/providers/provider.routes.js';
import productRoutes from '../src/products/product.routes.js';
import invoiceRoutes from '../src/invoices/invoice.routes.js';
import clientsRoutes from '../src/clients/client.routes.js';
import salesRoutes from '../src/sales/sale.routes.js';

const middlewares = (app) => {
    app.use(express.urlencoded({ extended: false }));
    app.use(cors());
    app.use(express.json());
    app.use(
    helmet.crossOriginResourcePolicy({ policy: "cross-origin" })
    );
    app.use(morgan('dev'));
    app.use(limiter);

    // Sirve carpeta uploads como pública
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
}


import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routes = (app) =>{
    app.use('/MundoChino/v1/auth', authRoutes);
    app.use('/MundoChino/v1/user', userRoutes);
    app.use('/MundoChino/v1/provider', providerRoutes);
    app.use('/MundoChino/v1/product', productRoutes);
    app.use('/MundoChino/v1/invoice', invoiceRoutes);
    app.use('/MundoChino/v1/client', clientsRoutes);
    app.use('/MundoChino/v1/sale', salesRoutes);
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

}

const conectarDB = async () => {
    try{
        await dbConnection();
        console.log("Conexion a la base de datos exitosa");
    }catch(error){
        console.error('Error Conectando a la base de datos', error);
        process.exit(1);
    }
}

export const initServer = async () =>{
    const app = express();
    const port = process.env.PORT || 3333;

    try {
        middlewares(app);
        conectarDB();
        routes(app);
        app.listen(port);
        console.log(`Server running on port:  ${port}`)

    } catch (err) {
        console.log(`Server init fail : ${err}`)
    }
}