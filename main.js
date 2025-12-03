import express from 'express';
import Api from './src/api/api.js';
import auth from './src/middleware/auth.js';
import cors from 'cors'

const PORT = process.env.PORT || 3000;

const Server = express();

// Middleware
Server.use(express.json());
Server.use(express.urlencoded({ extended: true }));
Server.use(cors({
    origin: '*', // Your frontend URL
    credentials: true,
    allowedHeaders: ['Content-Type', 'App-Key', 'Token', 'Access'] 
}));

// Routes - use auth without parentheses
Server.use('/api', auth, Api);

// Error handling middleware
Server.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

Server.get("/", (req, res) => {
    res.send("ready");
})
Server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});