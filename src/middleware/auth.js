import { config } from "dotenv";
config();

function auth(req, res, next) {
    const appKey = req.headers['app-key'];
    const token = req.headers['token'];
    
    console.log('Auth Debug - APP_KEY:', process.env.APP_KEY);
    console.log('Auth Debug - Headers:', { appKey, token });

    // Check if App Key is valid
    if (appKey !== process.env.APP_KEY) {
        console.log('Unauthenticated: Invalid App Key');
        return res.status(401).json({
            success: false,
            message: 'Invalid App Key'
        });
    }

    // If all checks pass, continue to next middleware/route
    console.log('Authentication successful');
    next();
}

export function requireToken(req, res, next) {
    console.log("🔐 requireToken middleware executing");
    
    const token = req.headers['token']; // ← FIX: Define token variable
    
    // For POST, PUT, DELETE methods, require token
    if (req.headers['Access'] === 'user') {
        if (!token) {
            console.log('Unauthenticated: Token required');
            return res.status(401).json({
                success: false,
                message: 'Token required for this operation'
            });
        }

        // Add your token verification logic here
        const isTokenValid = verifyToken(token);

        if (!isTokenValid) {
            console.log('Unauthenticated: Invalid token');
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    }
    
    // Always call next() unless you return an error
    next();
}

// Example token verification function
const verifyToken = (token) => {
    return token && token.length > 0;
}

export default auth;