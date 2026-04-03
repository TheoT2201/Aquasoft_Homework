'use client';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && user && roles.length && !roles.includes(user.role)) {
      router.push('/dashboard');
    }
  }, [user, loading]);

  if (loading) return <p>Loading...</p>;
  return user ? children : null;
}