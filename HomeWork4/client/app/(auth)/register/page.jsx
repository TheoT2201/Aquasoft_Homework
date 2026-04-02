'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useState } from 'react';
import styles from './register.module.css';

const ROLE_ROUTES = {
  Administrator: '/dashboards/admin',
  HotelManager:  '/dashboards/hotelmanager',
  GroupManager:  '/dashboards/groupmanager',
  DataOperator:  '/dashboards/operator',
  Traveler:      '/dashboards/traveler',
};

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password1: '',
    password2: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.password1 || !form.password2) {
      setError('Please confirm your password.');
      return;
    }
    if (form.password1 !== form.password2) {
      setError('Passwords do not match.');
      return;
    }
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (form.password1.length < 6 || !specialCharRegex.test(form.password1)) {
      setError('Password must be at least 6 characters and contain a special character.');
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        firstName: form.firstName,
        lastName:  form.lastName,
        email:     form.email,
        password:  form.password1,
        role:      'Traveler',
      });
      const route = ROLE_ROUTES[user?.role] || '/dashboards/traveler';
      router.push(route);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.mainTitle}>
        <span className={styles.underlineText}>Hotel Starwards</span>
        <span className={styles.starIcon}>★</span>
      </h1>

      <div className={styles.formCard}>
        <h2 className={styles.formHeading}>Sign Up</h2>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.formLayout}>
          <input
            type="text"
            placeholder="First Name"
            value={form.firstName}
            onChange={e => setForm({ ...form, firstName: e.target.value })}
            required
            className={styles.inputField}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={form.lastName}
            onChange={e => setForm({ ...form, lastName: e.target.value })}
            required
            className={styles.inputField}
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
            className={styles.inputField}
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password1}
            onChange={e => setForm({ ...form, password1: e.target.value })}
            required
            className={styles.inputField}
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={form.password2}
            onChange={e => setForm({ ...form, password2: e.target.value })}
            required
            className={styles.inputField}
          />

          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className={styles.switchText}>
          Already have an account?{' '}
          <button onClick={() => router.push('/login')} className={styles.link}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}