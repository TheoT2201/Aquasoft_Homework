import * as dotenv from 'dotenv';
dotenv.config();

import * as express from 'express';
import { testConnection } from './config/database';
import hotelRoutes from './routes/hotelRoutes';
import authRoutes from './routes/authRoutes';

const app = express();
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/hotels', hotelRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    await testConnection();
    console.log(`Server running on port ${PORT}`);
});