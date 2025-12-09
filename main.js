import express from 'express';
import Api from './src/api/api.js';
import auth from './src/middleware/auth.js';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const PORT = process.env.PORT || 3000;

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const Server = express();

// Absolute uploads directory inside this project
const UPLOADS_DIR = path.join(__dirname, 'uploads/profile-images/parents');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    console.log('Created uploads directory:', UPLOADS_DIR);
} else {
    console.log('Uploads directory exists:', UPLOADS_DIR);
}

// CORS middleware
Server.use(cors({
    origin: '*',
    credentials: true,
    allowedHeaders: ['Content-Type', 'App-Key', 'Token', 'Access']
}));

// File upload middleware (must come BEFORE body parsers)
Server.use(fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    abortOnLimit: true,
    createParentPath: true,
    useTempFiles: false,
    debug: true
}));

// Body parsers
Server.use(express.json());
Server.use(express.urlencoded({ extended: true }));

// Serve static files
Server.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// DEBUG endpoint
Server.get('/debug', (req, res) => {
    try {
        const files = fs.readdirSync(UPLOADS_DIR);
        res.json({
            success: true,
            uploadsDirectory: UPLOADS_DIR,
            fileCount: files.length,
            files
        });
    } catch (err) {
        res.json({ success: false, error: err.message });
    }
});

// TEST UPLOAD endpoint
Server.post('/test-upload', (req, res) => {
    console.log('=== TEST UPLOAD ===');
    console.log('Request files:', req.files);

    if (!req.files || !req.files.profile_image) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const file = req.files.profile_image;
    const fileName = `test_${Date.now()}_${file.name}`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    console.log('Saving file to:', filePath);

    file.mv(filePath, (err) => {
        if (err) {
            console.error('Error saving file:', err);
            return res.status(500).json({ success: false, error: err.message });
        }

        res.json({
            success: true,
            message: 'File uploaded successfully',
            fileName,
            url: `/uploads/profile-images/parents/${fileName}`
        });
    });
});

// In server.js, add this:
const TUTOR_UPLOADS_DIR = path.join(__dirname, 'uploads/profile-images/tutors');

// Ensure tutor uploads directory exists
if (!fs.existsSync(TUTOR_UPLOADS_DIR)) {
    fs.mkdirSync(TUTOR_UPLOADS_DIR, { recursive: true });
    console.log('Created tutor uploads directory:', TUTOR_UPLOADS_DIR);
} else {
    console.log('Tutor uploads directory exists:', TUTOR_UPLOADS_DIR);
}

// API routes
Server.use('/api', auth, Api);

// Error handler
Server.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

// Home page
Server.get('/', (req, res) => {
    res.send(`
        <h1>Tutorial Hub Server</h1>
        <form action="/test-upload" method="post" enctype="multipart/form-data">
            <input type="file" name="profile_image" required>
            <button type="submit">Upload</button>
        </form>
    `);
});

Server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 Uploads directory: ${UPLOADS_DIR}`);
});
