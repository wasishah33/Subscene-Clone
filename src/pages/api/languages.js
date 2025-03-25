import { getLanguages } from '../../api/db';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get all available languages
    const languages = await getLanguages();
    
    // Return the languages
    return res.status(200).json(languages);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 