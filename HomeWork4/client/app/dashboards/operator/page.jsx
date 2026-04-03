'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from '../../../lib/axios';
import styles from './operator.module.css';

const TABS = ['Ratings', 'Reviews', 'Data Quality'];

export default function OperatorDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('Ratings');

  const [ratings, setRatings]           = useState([]);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [refreshing, setRefreshing]     = useState(false);
  const [refreshMsg, setRefreshMsg]     = useState('');
  const [lastComputed, setLastComputed] = useState(null);

  const [reviews, setReviews]         = useState([]);
  const [revTotal, setRevTotal]       = useState(0);
  const [revOffset, setRevOffset]     = useState(0);
  const [revSearch, setRevSearch]     = useState('');
  const [revLoading, setRevLoading]   = useState(false);
  const [deleting, setDeleting]       = useState(null);
  const REV_LIMIT = 30;

  const [gaps, setGaps]           = useState([]);
  const [gapsLoading, setGapsLoading] = useState(false);

  const fetchRatings = useCallback(async () => {
    setRatingsLoading(true);
    try {
      const res = await axios.get('/api/ratings');
      const data = res.data?.ratings || res.data || [];
      setRatings(Array.isArray(data) ? data : []);
      if (data[0]?.ComputedAt || data[0]?.computed_at) {
        setLastComputed(data[0]?.ComputedAt || data[0]?.computed_at);
      }
    } catch { setRatings([]); }
    finally  { setRatingsLoading(false); }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshMsg('');
    try {
      const res = await axios.post('/api/ratings/refresh');
      setRefreshMsg(`✓ Refreshed ${res.data?.hotels?.length || 0} hotels.`);
      await fetchRatings();
    } catch { setRefreshMsg('✗ Refresh failed.'); }
    finally  { setRefreshing(false); }
  };

  const fetchReviews = useCallback(async (q, off, replace = true) => {
    setRevLoading(true);
    try {
      const res = await axios.get('/api/reviews', {
        params: { search: q, limit: REV_LIMIT, offset: off },
      });
      const data = res.data?.reviews || [];
      setRevTotal(res.data?.total || 0);
      setReviews(prev => replace ? data : [...prev, ...data]);
      setRevOffset(off + REV_LIMIT);
    } catch { }
    finally  { setRevLoading(false); }
  }, []);

  useEffect(() => {
    setRevOffset(0);
    const t = setTimeout(() => fetchReviews(revSearch, 0, true), 400);
    return () => clearTimeout(t);
  }, [revSearch]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this review? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/reviews/${id}`);
      setReviews(prev => prev.filter(r => (r.ReviewID || r.reviewid) !== id));
      setRevTotal(t => t - 1);
    } catch { alert('Failed to delete review.'); }
    finally  { setDeleting(null); }
  };

  // Fetch data quality gaps
  const fetchGaps = useCallback(async () => {
    setGapsLoading(true);
    try {
      const [hotelsRes, ratingsRes] = await Promise.all([
        axios.get('/api/hotels', { params: { limit: 1000, offset: 0 } }),
        axios.get('/api/ratings'),
      ]);
      const hotels  = hotelsRes.data?.hotels || [];
      const ratingMap = new Map();
      const rData = ratingsRes.data?.ratings || [];
      rData.forEach(r => {
        const id = String(r.GlobalPropertyID || r.globalpropertyid);
        ratingMap.set(id, r);
      });

      const gapList = hotels.map(h => {
        const id     = String(h.GlobalPropertyID || h.globalpropertyid);
        const rating = ratingMap.get(id);
        const issues = [];
        if (!rating) issues.push('No rating computed');
        else {
          if ((rating.ReviewCount || rating.review_count || 0) === 0)   issues.push('No reviews');
          if ((rating.AmenityCount || rating.amenity_count || 0) === 0)  issues.push('No amenities');
          if (!(h.DistanceToTheAirport || h.distancetotheairport))       issues.push('No airport distance');
          if (!(h.NumberOfRooms || h.numberofrooms))                     issues.push('No room count');
          if (!(h.SabrePropertyRating || h.sabrepropertyrating))         issues.push('No Sabre rating');
        }
        return {
          id,
          name:   h.GlobalPropertyName || h.globalpropertyname,
          issues,
          score:  rating ? (rating.CompositeScore || rating.composite_score) : null,
          rank:   rating ? (rating.Rank || rating.rank) : null,
        };
      }).filter(h => h.issues.length > 0)
        .sort((a, b) => b.issues.length - a.issues.length);

      setGaps(gapList);
    } catch { setGaps([]); }
    finally  { setGapsLoading(false); }
  }, []);

  // Load on tab switch
  useEffect(() => {
    if (tab === 'Ratings')      fetchRatings();
    if (tab === 'Reviews')      fetchReviews(revSearch, 0, true);
    if (tab === 'Data Quality') fetchGaps();
  }, [tab]);

  const score = (r, key, fallback) => {
    const v = r[key] ?? r[key.toLowerCase()] ?? fallback;
    return v != null ? parseFloat(v).toFixed(2) : '—';
  };

  return (
    <div className={styles.page}>

      <nav className={styles.nav}>
        <div className={styles.navBrand}>
          <span className={styles.navStar}>★</span>
          <span className={styles.navTitle}>Hotel Starwards</span>
          <span className={styles.navRole}>Data Operator</span>
        </div>
        <div className={styles.navRight}>
          <span className={styles.navUser}>{user?.firstName} {user?.lastName}</span>
          <button className={styles.logoutBtn} onClick={() => { logout(); router.push('/login'); }}>
            Log out
          </button>
        </div>
      </nav>

      <div className={styles.tabBar}>
        {TABS.map(t => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className={styles.body}>

        {tab === 'Ratings' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Hotel Rankings</h2>
                {lastComputed && (
                  <p className={styles.sectionSub}>
                    Last computed: {new Date(lastComputed).toLocaleString()}
                  </p>
                )}
              </div>
              <div className={styles.refreshArea}>
                {refreshMsg && (
                  <span className={refreshMsg.startsWith('✓') ? styles.successMsg : styles.errorMsg}>
                    {refreshMsg}
                  </span>
                )}
                <button
                  className={styles.refreshBtn}
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  {refreshing ? 'Refreshing...' : '↻ Refresh Scores'}
                </button>
              </div>
            </div>

            {ratingsLoading ? (
              <p className={styles.loadingText}>Loading ratings...</p>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Hotel</th>
                      <th>Score</th>
                      <th>Overall</th>
                      <th>Cleanliness</th>
                      <th>Service</th>
                      <th>Amenities</th>
                      <th>Distance</th>
                      <th>Reviews</th>
                      <th>Reliable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ratings.map(r => {
                      const name = r.Hotel?.GlobalPropertyName || r.Hotel?.globalpropertyname || '—';
                      const reliable = r.ReviewsReliable ?? r.reviews_reliable;
                      return (
                        <tr key={r.GlobalPropertyID || r.globalpropertyid}>
                          <td className={styles.tdRank}>#{r.Rank || r.rank}</td>
                          <td className={styles.tdName}>{name}</td>
                          <td className={styles.tdScore}>{score(r, 'CompositeScore', null)}</td>
                          <td>{score(r, 'OverallScore', null)}</td>
                          <td>{score(r, 'CleanlinessScore', null)}</td>
                          <td>{score(r, 'ServiceScore', null)}</td>
                          <td>{score(r, 'AmenityScore', null)}</td>
                          <td>{score(r, 'DistanceScore', null)}</td>
                          <td>{r.ReviewCount ?? r.review_count ?? '—'}</td>
                          <td>
                            <span className={reliable ? styles.yes : styles.no}>
                              {reliable ? 'Yes' : 'No'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'Reviews' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>All Reviews</h2>
                <p className={styles.sectionSub}>{revTotal} total reviews</p>
              </div>
              <input
                className={styles.searchInput}
                placeholder="Search by reviewer, title, content..."
                value={revSearch}
                onChange={e => setRevSearch(e.target.value)}
              />
            </div>

            {revLoading && reviews.length === 0 ? (
              <p className={styles.loadingText}>Loading reviews...</p>
            ) : (
              <>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Hotel ID</th>
                        <th>Reviewer</th>
                        <th>Title</th>
                        <th>Rating</th>
                        <th>Trip Type</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map(r => {
                        const id = r.ReviewID || r.reviewid;
                        return (
                          <tr key={id}>
                            <td className={styles.tdMono}>{r.GlobalPropertyID || r.globalpropertyid}</td>
                            <td>{r.ReviewerName || r.reviewername}</td>
                            <td className={styles.tdTitle}>{r.ReviewTitle || r.reviewtitle || '—'}</td>
                            <td className={styles.tdScore}>{r.OverallRating || r.overallrating}</td>
                            <td>{r.TripType || r.triptype || '—'}</td>
                            <td className={styles.tdMono}>{r.ReviewDate || r.reviewdate}</td>
                            <td>
                              <button
                                className={styles.deleteBtn}
                                onClick={() => handleDelete(id)}
                                disabled={deleting === id}
                              >
                                {deleting === id ? '...' : 'Delete'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {reviews.length < revTotal && (
                  <button
                    className={styles.loadMoreBtn}
                    onClick={() => fetchReviews(revSearch, revOffset, false)}
                    disabled={revLoading}
                  >
                    {revLoading ? 'Loading...' : `Load more (${reviews.length} of ${revTotal})`}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {tab === 'Data Quality' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Data Quality</h2>
                <p className={styles.sectionSub}>
                  {gaps.length} hotels with missing or incomplete data
                </p>
              </div>
              <button className={styles.refreshBtn} onClick={fetchGaps} disabled={gapsLoading}>
                {gapsLoading ? 'Scanning...' : '↻ Rescan'}
              </button>
            </div>

            {gapsLoading ? (
              <p className={styles.loadingText}>Scanning hotels...</p>
            ) : gaps.length === 0 ? (
              <div className={styles.allGood}>
                ✓ All hotels have complete data
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Hotel</th>
                      <th>Score</th>
                      <th>Rank</th>
                      <th>Issues</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gaps.map(h => (
                      <tr key={h.id}>
                        <td className={styles.tdName}>{h.name}</td>
                        <td className={styles.tdScore}>{h.score != null ? parseFloat(h.score).toFixed(2) : '—'}</td>
                        <td>{h.rank ? `#${h.rank}` : '—'}</td>
                        <td>
                          <div className={styles.issueWrap}>
                            {h.issues.map(issue => (
                              <span key={issue} className={styles.issueBadge}>{issue}</span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}