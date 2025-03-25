import { initializeAuthTables, registerUser } from '../../../api/auth';
import cookie from 'cookie';

// Initialize auth tables on server startup
(async () => {
  try {
    await initializeAuthTables();
  } catch (error) {
    console.error('Failed to initialize auth tables:', error);
  }
})();

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { username, email, password, fullName } = req.body;
    
    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username, email, and password are required' 
      });
    }
    
    // Validate username format
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username must be 3-20 characters and contain only letters, numbers, and underscores' 
      });
    }
    
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }
    
    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 8 characters long' 
      });
    }
    
    // Register the user
    const user = await registerUser({ username, email, password, fullName });
    
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific errors
    if (error.message === 'Username already taken' || error.message === 'Email already registered') {
      return res.status(409).json({ success: false, message: error.message });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Registration failed. Please try again.' 
    });
  }
} 