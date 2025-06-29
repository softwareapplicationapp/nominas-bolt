# ArcusHR - Human Resource Management Platform

A complete HR management solution built with Next.js, featuring employee management, attendance tracking, leave management, and more.

## Features

- **Employee Management**: Complete employee profiles and organizational structure
- **Attendance Tracking**: Real-time check-in/out with detailed reporting
- **Leave Management**: Request and approval workflow for time off
- **Payroll Management**: Salary processing and payslip generation
- **Project Management**: Track projects and task assignments
- **Reports & Analytics**: Comprehensive insights and data analysis
- **Role-based Access**: Admin and employee portals with appropriate permissions

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase Postgres
- **Authentication**: JWT with refresh tokens
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

The application is ready for serverless deployment on platforms like Netlify, Vercel, or similar.

### Build Command

```bash
npm run build
```

### Environment Variables

The application uses JWT secrets for authentication. In production, set these environment variables:

- `JWT_SECRET`: Secret key for access tokens
- `JWT_REFRESH_SECRET`: Secret key for refresh tokens

### Database

This version uses **Supabase** as the persistent database. Set the following environment variables in your deployment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

The previous in-memory store has been removed.

## Default Login Credentials

The application comes with pre-seeded demo data:

- **Admin**: admin@demo.com / admin123
- **Employee**: employee@demo.com / employee123

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Admin dashboard pages
│   └── employee/          # Employee portal pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Admin dashboard components
│   └── employee/         # Employee portal components
├── lib/                   # Utility libraries
│   ├── auth.ts           # Authentication utilities
│   ├── database.ts       # Supabase query helpers
│   └── api-client.ts     # API client for frontend
├── contexts/              # React contexts
└── netlify.toml          # Netlify deployment configuration
```

## API Routes

- `/api/auth/*` - Authentication endpoints
- `/api/employees/*` - Employee management
- `/api/attendance/*` - Attendance tracking
- `/api/leaves/*` - Leave management
- `/api/dashboard/*` - Dashboard statistics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.