import express, { json } from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import logger  from './utils/logger.js';
import aiRoutes from './routes/aiRoutes.js'
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(json());
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api', routes);
app.use('/api/aiapi', aiRoutes)
// Error handling
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});
