import { getSubtitleById } from '../../../api/db';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the subtitle ID from the URL
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ message: 'Subtitle ID is required' });
    }

    // Get the subtitle
    const subtitle = await getSubtitleById(id);
    
    if (!subtitle) {
      return res.status(404).json({ message: 'Subtitle not found' });
    }

    // Log IMDb ID details for debugging
    if (subtitle.imdb) {
      console.log('API: Subtitle IMDb ID data:', {
        raw: subtitle.imdb,
        type: typeof subtitle.imdb,
        hasTtPrefix: subtitle.imdb.toString().startsWith('tt'),
        length: subtitle.imdb.toString().length
      });
      
      // Ensure the IMDb ID has 'tt' prefix if it's missing
      if (typeof subtitle.imdb === 'string' && !subtitle.imdb.startsWith('tt')) {
        console.log('API: Adding missing tt prefix to IMDb ID');
        subtitle.imdb = 'tt' + subtitle.imdb;
      } else if (typeof subtitle.imdb === 'number') {
        console.log('API: Converting numeric IMDb ID to string with tt prefix');
        subtitle.imdb = 'tt' + subtitle.imdb.toString();
      }
    }

    // Return the subtitle
    return res.status(200).json(subtitle);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 