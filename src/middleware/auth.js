import { verifyToken } from '../api/auth';

// Middleware to check if user is authenticated
export function isAuthenticated(handler) {
  return async (req, res) => {
    try {
      // Get token from cookies or authorization header
      let token = req.cookies?.token;
      
      if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }
      
      if (!token) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized: No token provided' 
        });
      }
      
      // Verify token
      const decoded = verifyToken(token);
      
      if (!decoded) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized: Invalid token' 
        });
      }
      
      // Add user data to request
      req.user = decoded;
      
      // Call the original handler
      return handler(req, res);
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized: Authentication failed' 
      });
    }
  };
}

// Optional authentication middleware (doesn't require auth but adds user if authenticated)
export function optionalAuth(handler) {
  return async (req, res) => {
    try {
      // Get token from cookies or authorization header
      let token = req.cookies?.token;
      
      if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }
      
      if (token) {
        // Verify token
        const decoded = verifyToken(token);
        
        if (decoded) {
          // Add user data to request
          req.user = decoded;
        }
      }
      
      // Call the original handler
      return handler(req, res);
    } catch (error) {
      console.error('Optional auth error:', error);
      // Continue without authentication
      return handler(req, res);
    }
  };
} 