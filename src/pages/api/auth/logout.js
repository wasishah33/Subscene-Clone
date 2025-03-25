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
    // Clear the token cookie by setting an expired date
    res.setHeader('Set-Cookie', cookie.serialize('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0), // Set to epoch time to immediately expire
      sameSite: 'strict',
      path: '/'
    }));
    
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Logout failed. Please try again.' 
    });
  }
} 