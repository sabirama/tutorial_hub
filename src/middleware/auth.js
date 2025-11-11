import { config } from "dotenv";
config();

const auth = (req, res, next) => {
    const appKey = req.headers['app-key'];
    const token = req.headers['token'];
    // Check if App Key is valid
    if (appKey !== process.env.APP_KEY) {
        console.log('Unauthenticated: Invalid App Key');
        return res.status(401).json({
            success: false,
            message: 'Invalid App Key'
        });
    }

    // For POST, PUT, DELETE methods, require token
    if (['POST', 'PUT', 'DELETE'].includes(req.method.toUpperCase())) {
        if (!token) {
            console.log('Unauthenticated: Token required');
            return res.status(401).json({
                success: false,
                message: 'Token required for this operation'
            });
        }

        // Add your token verification logic here
        // Example: verify JWT token or check against database
        const isTokenValid = verifyToken(token); // You need to implement this
        
        if (!isTokenValid) {
            console.log('Unauthenticated: Invalid token');
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    }

    // If all checks pass, continue to next middleware/route
    console.log('Authentication successful');
    next();
}

// Example token verification function (you need to implement based on your auth system)
const verifyToken = (token) => {
    // Implement your token verification logic
    // This could be JWT verification, database check, etc.
    return token && token.length > 0; // Simple example
}

export default auth;