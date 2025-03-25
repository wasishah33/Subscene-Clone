import { loginUser } from '../../../api/auth';
import cookie from 'cookie';

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { username, password } = req.body;
    
    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }
    
    // Login the user
    const { token, user } = await loginUser({ username, password });
    
    // Set HTTP-only cookie with token
    res.setHeader('Set-Cookie', cookie.serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'strict',
      path: '/'
    }));
    
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle specific errors
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Login failed. Please try again.' 
    });
  }
} 