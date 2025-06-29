import { NextRequest, NextResponse } from 'next/server';
import { createUser, generateTokens } from '@/lib/auth';
import { dbRun, dbGet } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { email, password, companyName, industry } = await request.json();

    // Validate input
    if (!email || !password || !companyName) {
      return NextResponse.json(
        { error: 'Email, password, and company name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Create company
    const companyResult = await dbRun(
      'INSERT INTO companies (name, industry) VALUES (?, ?)',
      [companyName, industry || 'Technology']
    ) as any;
    const companyId = companyResult.lastID;

    // Create admin user
    const user = await createUser(email, password, 'admin', companyId);

    // Create employee record for the admin
    await dbRun(`
      INSERT INTO employees (user_id, employee_id, first_name, last_name, email, department, position, company_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      user.id,
      'EMP001',
      'Admin',
      'User',
      email,
      'Administration',
      'Administrator',
      companyId,
      'active'
    ]);

    // Generate tokens
    const tokens = generateTokens(user);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.company_id
      },
      ...tokens
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}