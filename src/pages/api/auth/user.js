import { verifyToken, getUserById } from '../../../api/auth';

export default async function handler(req, res) {
  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // Get token from cookies
    const { token } = req.cookies;
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    
    // Get user data from database
    const user = await getUserById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Return user data (without password)
    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to get user information' 
    });
  }
} 