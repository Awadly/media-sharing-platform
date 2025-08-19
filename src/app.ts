import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mediaRoutes from './routes/mediaRoutes';

dotenv.config();

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/api/media', mediaRoutes);

export default app;
