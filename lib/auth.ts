import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { dbRun, dbGet } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';

export interface User {
  id: string; // Changed from number to string for UUID
  email: string;
  role: string;
  company_id: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateTokens(user: User): AuthTokens {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role, companyId: user.company_id },
    JWT_SECRET,
    { expiresIn: '15m' } // Shorter expiry for better security
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): User | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      company_id: decoded.companyId
    };
  } catch (error) {
    // Don't log expired token errors as they're expected
    if (error instanceof jwt.TokenExpiredError) {
      return null;
    }
    console.error('Token verification error:', error);
    return null;
  }
}

export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as any;
    return { userId: decoded.userId };
  } catch (error) {
    return null;
  }
}

export async function getUserFromRequest(request: NextRequest): Promise<User | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const user = verifyAccessToken(token);
  
  if (!user) {
    return null;
  }

  // Verify user still exists in database
  const dbUser = await dbGet('SELECT * FROM users WHERE id = ?', [user.id]);
  if (!dbUser) {
    return null;
  }

  return user;
}

export async function createUser(email: string, password: string, role: string = 'employee', companyId?: number): Promise<User> {
  const hashedPassword = await hashPassword(password);
  
  const result = await dbRun(
    'INSERT INTO users (email, password_hash, role, company_id) VALUES (?, ?, ?, ?)',
    [email, hashedPassword, role, companyId]
  );
  
  return {
    id: result.lastID,
    email,
    role,
    company_id: companyId || 0
  };
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]) as any;
  
  if (!user) {
    return null;
  }

  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    company_id: user.company_id
  };
}