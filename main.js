import express from 'express';
import Api from './src/api/api.js';

const PORT = process.env.PORT || 3000;

const Server = express();

Server.use(express.json());
Server.use(express.urlencoded({ extended: true }));
Server.use('/api', Api);

Server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});