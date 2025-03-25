import path from 'path';
import fs from 'fs';
import { query } from './db';

// Set up uploads table name
const UPLOADS_TABLE = 'subtitle_uploads';
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Initialize uploads table
export async function initializeUploadsTable() {
  try {
    // Check if uploads table exists
    const checkTableSql = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = $1
      );
    `;
    
    const tableExists = await query(checkTableSql, [UPLOADS_TABLE]);
    
    if (!tableExists[0].exists) {
      console.log(`Creating ${UPLOADS_TABLE} table...`);
      
      // Create uploads table
      const createTableSql = `
        CREATE TABLE ${UPLOADS_TABLE} (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          imdb VARCHAR(20),
          lang VARCHAR(50) NOT NULL,
          author_name VARCHAR(100) NOT NULL,
          comment TEXT,
          releases TEXT,
          file_path VARCHAR(255) NOT NULL,
          original_filename VARCHAR(255) NOT NULL,
          file_size INTEGER NOT NULL,
          download_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `;
      
      await query(createTableSql);
      console.log(`Created ${UPLOADS_TABLE} table.`);
    }
  } catch (error) {
    console.error('Error initializing uploads table:', error);
    throw error;
  }
}

// Save uploaded subtitle
export async function saveUploadedSubtitle(data, userId) {
  try {
    const { 
      title, 
      imdb, 
      lang, 
      authorName, 
      comment, 
      releases, 
      filePath, 
      originalFilename, 
      fileSize 
    } = data;
    
    // Insert upload into database
    const insertSql = `
      INSERT INTO ${UPLOADS_TABLE} (
        user_id, title, imdb, lang, author_name, 
        comment, releases, file_path, original_filename, file_size
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      userId,
      title,
      imdb,
      lang,
      authorName,
      comment || null,
      releases || null,
      filePath,
      originalFilename,
      fileSize
    ];
    
    const result = await query(insertSql, values);
    return result[0];
  } catch (error) {
    console.error('Error saving uploaded subtitle:', error);
    throw error;
  }
}

// Get user's uploaded subtitles
export async function getUserUploads(userId) {
  try {
    const sql = `
      SELECT * FROM ${UPLOADS_TABLE}
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    
    return await query(sql, [userId]);
  } catch (error) {
    console.error('Error getting user uploads:', error);
    throw error;
  }
}

// Get upload by ID
export async function getUploadById(id) {
  try {
    const sql = `
      SELECT * FROM ${UPLOADS_TABLE}
      WHERE id = $1
    `;
    
    const results = await query(sql, [id]);
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Error getting upload by ID:', error);
    throw error;
  }
}

// Delete upload by ID
export async function deleteUpload(id, userId) {
  try {
    // Get the upload first to check ownership and get file path
    const upload = await getUploadById(id);
    
    if (!upload) {
      throw new Error('Upload not found');
    }
    
    if (upload.user_id !== userId) {
      throw new Error('Unauthorized: You do not own this upload');
    }
    
    // Delete from database
    const sql = `
      DELETE FROM ${UPLOADS_TABLE}
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    
    const result = await query(sql, [id, userId]);
    
    if (result.length === 0) {
      throw new Error('Failed to delete upload');
    }
    
    // Delete file from filesystem
    try {
      fs.unlinkSync(upload.file_path);
    } catch (fsError) {
      console.error('Error deleting upload file:', fsError);
      // Continue even if file deletion fails
    }
    
    return result[0];
  } catch (error) {
    console.error('Error deleting upload:', error);
    throw error;
  }
}

// Increment download count
export async function incrementDownloadCount(id) {
  try {
    const sql = `
      UPDATE ${UPLOADS_TABLE}
      SET download_count = download_count + 1
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await query(sql, [id]);
    return result[0];
  } catch (error) {
    console.error('Error incrementing download count:', error);
    throw error;
  }
} 