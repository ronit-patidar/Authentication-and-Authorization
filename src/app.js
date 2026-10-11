import express from 'express';
import morgan from 'morgan';
import authRoute from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth",authRoute);

app.use(express.json());
app.use(morgan("dev"));

export default app;