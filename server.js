import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import app from './app.js';
import connectDB from './src/config/db.js'

const PORT = process.env.PORT


connectDB().then(() => {
    app.listen(PORT, () => {
       console.log(`server is running on port ${PORT}`);
    })
}).catch((error) => {
    console.error(`database connection error`, error.message);
});

