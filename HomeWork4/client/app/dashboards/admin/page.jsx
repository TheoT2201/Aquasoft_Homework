'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from '../../../lib/axios';
import styles from './admin.module.css';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('Pending');
  const [processing, setProcessing] = useState(null);
  const [error, setError]         = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    setRequests([]);
    try {
      const endpoint = filter === 'Pending'
        ? '/api/requests/pending'
        : '/api/requests';
      const res = await axios.get(endpoint);
      let data = Array.isArray(res.data) ? res.data : res.data.requests || [];
      if (filter !== 'Pending' && filter !== 'All') {
        data = data.filter(r => r.Status === filter || r.status === filter);
      }
      setRequests(data);
    } catch {
      setError('Failed to load requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [filter]);

  const handleProcess = async (id, action) => {
    setProcessing(id);
    setError('');
    try {
      await axios.patch(`/api/requests/${id}/process`, { action });
      await fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action.toLowerCase()} request.`);
    } finally {
      setProcessing(null);
    }
  };

  const getStatus = (r) => r.Status || r.status;
  const getRole   = (r) => r.RequestedRole || r.requestedrole;
  const getDesc   = (r) => r.Description || r.description;
  const getDoc    = (r) => r.DocumentURL || r.documenturl;
  const getDate   = (r) => {
    const d = r.createdAt || r.createdat;
    return d ? new Date(d).toLocaleDateString() : '—';
  };
  const getUser   = (r) => {
    const u = r.User || r.user;
    if (!u) return '—';
    return `${u.firstName || u.firstname || ''} ${u.lastName || u.lastname || ''}`.trim() || u.email;
  };
  const getUserEmail = (r) => {
    const u = r.User || r.user;
    return u?.email || '—';
  };

  const statusColor = (s) => {
    if (s === 'Pending')  return styles.badgePending;
    if (s === 'Approved') return styles.badgeApproved;
    if (s === 'Rejected') return styles.badgeRejected;
    return '';
  };

  return (
    <div className={styles.page}>

      {/* Navbar */}
      <nav className={styles.nav}>
        <div className={styles.navBrand}>
          <span className={styles.navStar}>★</span>
          <span className={styles.navTitle}>Hotel Starwards</span>
          <span className={styles.navRole}>Administrator</span>
        </div>
        <div className={styles.navRight}>
          <span className={styles.navUser}>{user?.firstName} {user?.lastName}</span>
          <button className={styles.logoutBtn} onClick={() => { logout(); router.push('/login'); }}>
            Log out
          </button>
        </div>
      </nav>

      <div className={styles.body}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>Role Requests</h1>
            <p className={styles.pageSubtitle}>
              Review and process user requests for Hotel Manager or Group Manager roles.
            </p>
          </div>

          {/* Filter tabs */}
          <div className={styles.tabs}>
            {['Pending', 'Approved', 'Rejected', 'All'].map(f => (
              <button
                key={f}
                className={`${styles.tab} ${filter === f ? styles.tabActive : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {loading ? (
          <div className={styles.loadingState}>Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className={styles.emptyState}>
            No {filter === 'All' ? '' : filter.toLowerCase()} requests found.
          </div>
        ) : (
          <div className={styles.requestList}>
            {requests.map(req => {
              const id     = req.RequestID || req.requestid;
              const status = getStatus(req);
              const isPending = status === 'Pending';
              const isProcessing = processing === id;

              return (
                <div key={id} className={styles.requestCard}>
                  <div className={styles.cardTop}>
                    <div className={styles.userInfo}>
                      <div className={styles.avatar}>
                        {getUser(req).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={styles.userName}>{getUser(req)}</p>
                        <p className={styles.userEmail}>{getUserEmail(req)}</p>
                      </div>
                    </div>
                    <div className={styles.cardMeta}>
                      <span className={`${styles.roleBadge}`}>{getRole(req)}</span>
                      <span className={`${styles.statusBadge} ${statusColor(status)}`}>
                        {status}
                      </span>
                    </div>
                  </div>

                  {getDesc(req) && (
                    <p className={styles.description}>{getDesc(req)}</p>
                  )}

                  {getDoc(req) && (
                    <a
                      href={getDoc(req)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.docLink}
                    >
                      View document →
                    </a>
                  )}

                  <div className={styles.cardBottom}>
                    <span className={styles.requestDate}>Submitted {getDate(req)}</span>

                    {isPending && (
                      <div className={styles.actions}>
                        <button
                          className={styles.approveBtn}
                          disabled={isProcessing}
                          onClick={() => handleProcess(id, 'Approved')}
                        >
                          {isProcessing ? '...' : 'Approve'}
                        </button>
                        <button
                          className={styles.rejectBtn}
                          disabled={isProcessing}
                          onClick={() => handleProcess(id, 'Rejected')}
                        >
                          {isProcessing ? '...' : 'Reject'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}