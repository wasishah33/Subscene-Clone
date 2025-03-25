import { Pool } from 'pg';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Table name from environment variable with fallback
const TABLE_NAME = process.env.PG_TABLE || 'all_subs';

// Log when the pool is created
console.log('PostgreSQL pool created with config:', {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  table: TABLE_NAME
});

// Event handler for pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1); // Exit in case of critical errors
});

// Enhanced function to execute SQL queries with better error handling
export async function query(text, params = []) {
  let client;
  try {
    const start = Date.now();
    
    // Convert MySQL placeholders (?) to PostgreSQL placeholders ($1, $2, etc.) if needed
    const pgSql = text.includes('?') ? text.replace(/\?/g, (_, index) => `$${index + 1}`) : text;
    
    // For debugging
    const sqlForLog = pgSql.length > 200 ? pgSql.substring(0, 200) + '...' : pgSql;
    
    // Get a client from the pool
    client = await pool.connect();
    
    // Execute the query
    const result = await client.query(pgSql, params);
    
    const duration = Date.now() - start;
    
    // Log query time for development debugging
    if (process.env.NODE_ENV !== 'production') {
      console.log('Executed query', { text: sqlForLog, duration, rows: result.rowCount });
    }
    
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error(`Database error: ${error.message}`);
  } finally {
    // Release the client back to the pool
    if (client) client.release();
  }
}

// Initialization function to check database connection
export async function initializeDatabase() {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL database');
    client.release();
    return true;
  } catch (error) {
    console.error('Failed to connect to PostgreSQL database:', error);
    return false;
  }
}

// Function to search subtitles with pagination
export async function searchSubtitles({ 
  searchTerm = '', 
  lang = '', 
  page = 1, 
  limit = 20,
  sortBy = 'date',
  sortOrder = 'desc'
}) {
  // Validate input
  page = Math.max(1, parseInt(page) || 1);
  limit = Math.max(1, Math.min(100, parseInt(limit) || 20));
  
  const offset = (page - 1) * limit;
  
  // Build the search condition
  let searchCondition = '';
  let params = [];
  let paramIndex = 1; // PostgreSQL uses $1, $2, etc.
  
  if (searchTerm && searchTerm.trim() !== '') {
    searchCondition = `
      (title ILIKE $${paramIndex} OR 
       COALESCE(imdb::text, '') ILIKE $${paramIndex + 1} OR 
       author_name ILIKE $${paramIndex + 2} OR 
       COALESCE(releases, '') ILIKE $${paramIndex + 3})
    `;
    params = [
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
    ];
    paramIndex += 4;
  }
  
  // Add language filter if specified
  if (lang && lang.trim() !== '') {
    searchCondition = searchCondition 
      ? `${searchCondition} AND lang = $${paramIndex}` 
      : `lang = $${paramIndex}`;
    params.push(lang);
    paramIndex++;
  }
  
  // Build the WHERE clause
  const whereClause = searchCondition ? `WHERE ${searchCondition}` : '';
  
  // Build the ORDER BY clause
  const validColumns = ['id', 'title', 'date', 'author_name', 'lang'];
  const validSortOrders = ['asc', 'desc'];
  
  const orderColumn = validColumns.includes(sortBy) ? sortBy : 'date';
  const order = validSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder : 'desc';
  
  const orderClause = `ORDER BY ${orderColumn} ${order}`;
  
  // Count total results for pagination info
  const countQuery = `
    SELECT COUNT(*) as total
    FROM ${TABLE_NAME}
    ${whereClause}
  `;
  
  // Main query with pagination
  const dataQuery = `
    SELECT *
    FROM ${TABLE_NAME}
    ${whereClause}
    ${orderClause}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  
  try {
    // Execute both queries
    const [countResult, data] = await Promise.all([
      query(countQuery, params),
      query(dataQuery, [...params, limit, offset])
    ]);
    
    // Extract total count
    const total = parseInt(countResult[0]?.total || '0');
    
    // Calculate pagination values
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;
    const hasPrev = page > 1;
    
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore,
        hasPrev
      }
    };
  } catch (error) {
    console.error('Error searching subtitles:', error);
    throw error;
  }
}

// Function to get languages for filter dropdown
export async function getLanguages() {
  const sql = `
    SELECT DISTINCT lang 
    FROM ${TABLE_NAME} 
    ORDER BY lang ASC
  `;
  
  return await query(sql);
}

// Function to get a subtitle by ID
export async function getSubtitleById(id) {
  if (!id) {
    throw new Error('Subtitle ID is required');
  }
  
  const sql = `
    SELECT * 
    FROM ${TABLE_NAME} 
    WHERE id = $1
  `;
  
  try {
    const results = await query(sql, [id]);
    return results[0] || null;
  } catch (error) {
    console.error(`Error fetching subtitle with ID ${id}:`, error);
    throw error;
  }
} 