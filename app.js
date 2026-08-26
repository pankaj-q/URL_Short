import express from 'express';
import urlRoutes from './src/routes/urlRoute.js'
const app = express();


app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api/url/', urlRoutes)
export default app;
