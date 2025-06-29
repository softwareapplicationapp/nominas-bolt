import { Metadata } from 'next';
import AuthPage from '@/components/auth/auth-page';

export const metadata: Metadata = {
  title: 'ArcusHR - Sign In',
  description: 'Sign in to your ArcusHR account',
};

export default function HomePage() {
  return <AuthPage />;
}