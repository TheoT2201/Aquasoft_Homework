'use client';
import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';
import '../../globals.css';

const ROLE_ROUTES = {
  Administrator: '/dashboards/admin',
  HotelManager:  '/dashboards/hotelmanager',
  GroupManager:  '/dashboards/groupmanager',
  DataOperator:  '/dashboards/operator',
  Traveler:      '/dashboards/traveler',
};

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const route = ROLE_ROUTES[user?.role] || '/dashboards/traveler';
      router.push(route);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.mainTitle}>
        <span className={styles.underlineText}>Hotel Starwards</span>
        <span className={styles.starIcon}>★</span>
      </h1>

      <div className={styles.card}>
        <h2 className={styles.formHeading}>Sign In</h2>
        <p className={styles.subtitle}>Welcome back</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
            className={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
            className={styles.input}
          />

          <button
            type="submit"
            disabled={loading}
            className={`${styles.btn} ${loading ? styles.btnLoading : ''}`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>or</span>
          <span className={styles.dividerLine} />
        </div>

        <p className={styles.switchText}>
          Don't have an account?{' '}
          <button onClick={() => router.push('/register')} className={styles.link}>
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}