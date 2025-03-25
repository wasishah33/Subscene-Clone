import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { isAuthenticated } from '../../../middleware/auth';
import { saveUploadedSubtitle } from '../../../api/uploads';

// Configure Next.js to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }
  
  try {
    // Get user ID from request (added by auth middleware)
    const { id: userId } = req.user;
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
    } catch (err) {
      console.error('Error creating uploads directory:', err);
    }

    // Parse form data with formidable
    const form = new IncomingForm({
      uploadDir: uploadsDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });

    return new Promise((resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Form parsing error:', err);
          res.status(500).json({ 
            success: false, 
            message: 'Failed to process upload' 
          });
          return resolve();
        }

        try {
          // Validate required fields
          const { title, imdb, lang } = fields;
          
          if (!title || !imdb || !lang) {
            res.status(400).json({ 
              success: false, 
              message: 'Title, IMDb ID, and language are required' 
            });
            return resolve();
          }
          
          // Check file
          if (!files.subtitle) {
            res.status(400).json({ 
              success: false, 
              message: 'Subtitle file is required' 
            });
            return resolve();
          }
          
          const subtitleFile = files.subtitle;
          
          // Only allow .zip files
          if (!subtitleFile.mimetype.includes('zip')) {
            // Remove the uploaded file
            await fs.unlink(subtitleFile.filepath);
            
            res.status(400).json({ 
              success: false, 
              message: 'Only ZIP files are accepted' 
            });
            return resolve();
          }
          
          // Generate unique filename
          const uniqueFilename = `${uuidv4()}${path.extname(subtitleFile.originalFilename)}`;
          const finalPath = path.join(uploadsDir, uniqueFilename);
          
          // Move file to final destination (if needed)
          if (subtitleFile.filepath !== finalPath) {
            await fs.rename(subtitleFile.filepath, finalPath);
          }
          
          // Get relative path for storage
          const relativePath = `/uploads/${uniqueFilename}`;
          
          // Save upload to database
          const upload = await saveUploadedSubtitle({
            userId,
            title: title,
            imdb: imdb,
            lang: lang,
            authorName: fields.authorName || '',
            comment: fields.comment || '',
            releases: fields.releases || '',
            filePath: relativePath,
            originalFilename: subtitleFile.originalFilename,
            fileSize: subtitleFile.size
          });
          
          res.status(201).json({
            success: true,
            message: 'Subtitle uploaded successfully',
            upload
          });
          return resolve();
        } catch (error) {
          console.error('Upload processing error:', error);
          res.status(500).json({ 
            success: false, 
            message: 'Failed to save upload' 
          });
          return resolve();
        }
      });
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Upload failed. Please try again.' 
    });
  }
}

// Wrap handler with authentication middleware
export default isAuthenticated(handler); 