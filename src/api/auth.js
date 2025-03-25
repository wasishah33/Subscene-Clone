import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from './db';

// Set up users table name
const USERS_TABLE = 'users';

// Get JWT secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET environment variable not set! Using a placeholder value for development only. This is not secure for production!');
}

const JWT_FALLBACK_SECRET = 'dev-placeholder-jwt-secret-unsafe-for-production-change-me';
const JWT_EXPIRES_IN = '7d';

// Create users table if it doesn't exist
export async function initializeAuthTables() {
  try {
    // Check if users table exists
    const checkTableSql = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = $1
      );
    `;
    
    const tableExists = await query(checkTableSql, [USERS_TABLE]);
    
    if (!tableExists[0].exists) {
      console.log(`Creating ${USERS_TABLE} table...`);
      
      // Create users table
      const createUsersSql = `
        CREATE TABLE ${USERS_TABLE} (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(100) NOT NULL,
          full_name VARCHAR(100),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `;
      
      await query(createUsersSql);
      console.log(`Created ${USERS_TABLE} table.`);
    }
  } catch (error) {
    console.error('Error initializing auth tables:', error);
    throw error;
  }
}

// Register a new user
export async function registerUser(userData) {
  try {
    const { username, email, password, fullName } = userData;
    
    // Check if user already exists
    const checkUserSql = `
      SELECT * FROM ${USERS_TABLE} 
      WHERE username = $1 OR email = $2
    `;
    
    const existingUsers = await query(checkUserSql, [username, email]);
    
    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      if (existingUser.username === username) {
        throw new Error('Username already taken');
      } else {
        throw new Error('Email already registered');
      }
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insert user into database
    const insertUserSql = `
      INSERT INTO ${USERS_TABLE} (username, email, password, full_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, email, full_name, created_at
    `;
    
    const newUser = await query(insertUserSql, [
      username, 
      email, 
      hashedPassword, 
      fullName || null
    ]);
    
    return newUser[0];
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

// Login a user
export async function loginUser(credentials) {
  try {
    const { username, password } = credentials;
    
    // Find user by username or email
    const findUserSql = `
      SELECT * FROM ${USERS_TABLE}
      WHERE username = $1 OR email = $1
    `;
    
    const users = await query(findUserSql, [username]);
    
    if (users.length === 0) {
      throw new Error('Invalid credentials');
    }
    
    const user = users[0];
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }
    
    // Create JWT token using the extracted createToken function
    const token = createToken({ id: user.id, username: user.username });
    
    return { 
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        createdAt: user.created_at
      }
    };
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
}

// Get user by ID
export async function getUserById(userId) {
  try {
    const findUserSql = `
      SELECT id, username, email, full_name, created_at, updated_at
      FROM ${USERS_TABLE}
      WHERE id = $1
    `;
    
    const users = await query(findUserSql, [userId]);
    
    if (users.length === 0) {
      return null;
    }
    
    return users[0];
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET || JWT_FALLBACK_SECRET);
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

// Create JWT token
export function createToken(payload) {
  return jwt.sign(
    payload,
    JWT_SECRET || JWT_FALLBACK_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
} 