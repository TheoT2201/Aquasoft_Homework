'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from '../../../lib/axios';
import styles from './traveler.module.css';

export default function TravelerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [hotels, setHotels]           = useState([]);
  const [selectedHotel, setSelected]  = useState(null);
  const [reviews, setReviews]         = useState([]);
  const [amenities, setAmenities]     = useState([]);
  const [offers, setOffers]           = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [search, setSearch]           = useState('');
  const [offset, setOffset]           = useState(0);
  const [total, setTotal]             = useState(0);
  const LIMIT = 20;

  // Debounced search — fires 400ms after user stops typing
  useEffect(() => {
    setOffset(0);
    setHotels([]);
    const timer = setTimeout(() => fetchHotels(search, 0, true), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchHotels = async (q, off, replace = false) => {
    setLoadingHotels(true);
    try {
      const res = await axios.get('/api/hotels', {
        params: { search: q, limit: LIMIT, offset: off },
      });
      const data = res.data;
      setTotal(data.total);
      setHotels(prev => replace ? data.hotels : [...prev, ...data.hotels]);
      setOffset(off + LIMIT);
    } catch {
      // silently fail
    } finally {
      setLoadingHotels(false);
    }
  };

  const loadMore = () => fetchHotels(search, offset, false);

  // Review form
  const [reviewForm, setReviewForm] = useState({
    OverallRating: '', ReviewTitle: '', ReviewContent: '',
    Cleanliness: '', Service: '', SleepQuality: '',
    Location: '', Rooms: '', TripType: '',
  });
  const [reviewError, setReviewError]     = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [submitting, setSubmitting]       = useState(false);

  // Role request modal
  const [showModal, setShowModal]         = useState(false);
  const [reqForm, setReqForm]             = useState({ requestedRole: 'HotelManager', description: '', documentUrl: '' });
  const [reqError, setReqError]           = useState('');
  const [reqSuccess, setReqSuccess]       = useState('');
  const [reqSubmitting, setReqSubmitting] = useState(false);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setReqError('');
    setReqSuccess('');
    if (!reqForm.description.trim()) {
      setReqError('Please provide a description.');
      return;
    }
    setReqSubmitting(true);
    try {
      await axios.post('/api/requests', reqForm);
      setReqSuccess('Request submitted! The administrator will review it shortly.');
      setReqForm({ requestedRole: 'HotelManager', description: '', documentUrl: '' });
    } catch (err) {
      setReqError(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setReqSubmitting(false);
    }
  };

  // Load hotel detail when selected
  useEffect(() => {
    if (!selectedHotel) return;
    setLoadingDetail(true);
    setReviews([]);
    setAmenities([]);
    setOffers([]);
    setReviewError('');
    setReviewSuccess('');

    const id = selectedHotel.GlobalPropertyID || selectedHotel.globalpropertyid;

    Promise.all([
      axios.get(`/api/reviews/${id}`).catch(() => ({ data: [] })),
      axios.get(`/api/amenities/${id}`).catch(() => ({ data: { amenities: [] } })),
      axios.get(`/api/priceoffers/${id}`).catch(() => ({ data: { offers: [] } })),
    ]).then(([rev, am, off]) => {
      setReviews(Array.isArray(rev.data) ? rev.data : []);
      setAmenities(am.data?.amenities || []);
      setOffers(off.data?.offers || []);
    }).finally(() => setLoadingDetail(false));
  }, [selectedHotel]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    if (!reviewForm.OverallRating) {
      setReviewError('Overall rating is required.');
      return;
    }
    setSubmitting(true);
    try {
      const id = selectedHotel.GlobalPropertyID || selectedHotel.globalpropertyid;
      await axios.post('/api/reviews', {
        GlobalPropertyID: id,
        ReviewDate: new Date().toISOString().split('T')[0],
        ...reviewForm,
      });
      setReviewSuccess('Review submitted successfully!');
      setReviewForm({
        OverallRating: '', ReviewTitle: '', ReviewContent: '',
        Cleanliness: '', Service: '', SleepQuality: '',
        Location: '', Rooms: '', TripType: '',
      });
      // Refresh reviews
      const res = await axios.get(`/api/reviews/${id}`).catch(() => ({ data: [] }));
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const name = (h) => h.GlobalPropertyName || h.globalpropertyname || 'Unknown Hotel';
  const addr = (h) => h.PropertyAddress1 || h.propertyaddress1 || '';
  const rating = (h) => h.SabrePropertyRating || h.sabrepropertyrating;

  return (
    <div className={styles.page}>

      {/* ── Navbar ── */}
      <nav className={styles.nav}>
        <div className={styles.navBrand}>
          <span className={styles.navStar}>★</span>
          <span className={styles.navTitle}>Hotel Starwards</span>
        </div>
        <div className={styles.navRight}>
          <button className={styles.requestBtn} onClick={() => { setShowModal(true); setReqError(''); setReqSuccess(''); }}>
            Request Role
          </button>
          <span className={styles.navUser}>
            {user?.firstName} {user?.lastName}
          </span>
          <button className={styles.logoutBtn} onClick={() => { logout(); router.push('/login'); }}>
            Log out
          </button>
        </div>
      </nav>

      {/* ── Role Request Modal ── */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Request a Role Upgrade</h2>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>✕</button>
            </div>

            {reqError   && <div className={styles.error}>{reqError}</div>}
            {reqSuccess && <div className={styles.success}>{reqSuccess}</div>}

            {!reqSuccess && (
              <form onSubmit={handleRequestSubmit} className={styles.modalForm}>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Requested role</label>
                  <select
                    className={styles.modalSelect}
                    value={reqForm.requestedRole}
                    onChange={e => setReqForm({ ...reqForm, requestedRole: e.target.value })}
                  >
                    <option value="HotelManager">Hotel Manager</option>
                    <option value="GroupManager">Group Manager</option>
                  </select>
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Why are you requesting this role? *</label>
                  <textarea
                    className={styles.modalTextarea}
                    placeholder="Describe your role and experience..."
                    rows={4}
                    value={reqForm.description}
                    onChange={e => setReqForm({ ...reqForm, description: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Document URL (optional)</label>
                  <input
                    type="url"
                    className={styles.modalInput}
                    placeholder="https://..."
                    value={reqForm.documentUrl}
                    onChange={e => setReqForm({ ...reqForm, documentUrl: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={reqSubmitting}
                  className={styles.modalSubmit}
                >
                  {reqSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <div className={styles.body}>

        {/* ── Left: Hotels list ── */}
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>Hotels</h2>
          <input
            className={styles.searchInput}
            placeholder="Search hotels..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {loadingHotels && <p className={styles.loadingText}>Loading hotels...</p>}
          <div className={styles.hotelList}>
            {hotels.map(hotel => {
              const id = hotel.GlobalPropertyID || hotel.globalpropertyid;
              const selectedId = selectedHotel?.GlobalPropertyID || selectedHotel?.globalpropertyid;
              return (
                <div
                  key={id}
                  className={`${styles.hotelCard} ${id === selectedId ? styles.hotelCardActive : ''}`}
                  onClick={() => setSelected(hotel)}
                >
                  <p className={styles.hotelCardName}>{name(hotel)}</p>
                  <p className={styles.hotelCardAddr}>{addr(hotel)}</p>
                  {rating(hotel) && (
                    <p className={styles.hotelCardRating}>★ {rating(hotel)}</p>
                  )}
                </div>
              );
            })}
            {loadingHotels && <p className={styles.loadingText}>Loading...</p>}
            {!loadingHotels && hotels.length === 0 && (
              <p className={styles.loadingText}>No hotels found.</p>
            )}
            {!loadingHotels && hotels.length < total && (
              <button className={styles.loadMoreBtn} onClick={loadMore}>
                Load more ({hotels.length} of {total})
              </button>
            )}
          </div>
        </aside>

        {/* ── Right: Hotel detail ── */}
        <main className={styles.detail}>
          {!selectedHotel ? (
            <div className={styles.emptyState}>
              <p>Select a hotel to view details</p>
            </div>
          ) : loadingDetail ? (
            <div className={styles.emptyState}><p>Loading...</p></div>
          ) : (
            <>
              <div className={styles.detailHeader}>
                <div>
                  <h2 className={styles.detailTitle}>{name(selectedHotel)}</h2>
                  <p className={styles.detailAddr}>{addr(selectedHotel)}</p>
                </div>
                {rating(selectedHotel) && (
                  <span className={styles.ratingBadge}>★ {rating(selectedHotel)}</span>
                )}
              </div>

              {/* Price Offers */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Price Offers</h3>
                {offers.length === 0 ? (
                  <p className={styles.emptyText}>No offers available.</p>
                ) : (
                  <div className={styles.offersGrid}>
                    {offers.map(o => (
                      <div key={o.OfferID || o.offerid} className={styles.offerCard}>
                        <p className={styles.offerCategory}>{o.Category || o.category}</p>
                        <p className={styles.offerPrice}>
                          ${o.PricePerNight || o.pricepernight}
                          <span className={styles.offerCurrency}> {o.Currency || o.currency}</span>
                        </p>
                        <p className={styles.offerNight}>per night</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Amenities */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Amenities ({amenities.length})</h3>
                {amenities.length === 0 ? (
                  <p className={styles.emptyText}>No amenities listed.</p>
                ) : (
                  <div className={styles.amenitiesWrap}>
                    {amenities.map(a => (
                      <span key={a.amenityid} className={styles.amenityTag}>
                        {a.amenityname}
                      </span>
                    ))}
                  </div>
                )}
              </section>

              {/* Reviews */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Reviews ({reviews.length})</h3>
                {reviews.length === 0 ? (
                  <p className={styles.emptyText}>No reviews yet.</p>
                ) : (
                  <div className={styles.reviewList}>
                    {reviews.map(r => (
                      <div key={r.ReviewID || r.reviewid} className={styles.reviewCard}>
                        <div className={styles.reviewTop}>
                          <span className={styles.reviewName}>{r.ReviewerName || r.reviewername}</span>
                          <span className={styles.reviewRating}>★ {r.OverallRating || r.overallrating}</span>
                        </div>
                        {(r.ReviewTitle || r.reviewtitle) && (
                          <p className={styles.reviewTitle}>{r.ReviewTitle || r.reviewtitle}</p>
                        )}
                        <p className={styles.reviewContent}>{r.ReviewContent || r.reviewcontent}</p>
                        <p className={styles.reviewDate}>{r.ReviewDate || r.reviewdate}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Write a Review */}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Write a Review</h3>
                {reviewError && <div className={styles.error}>{reviewError}</div>}
                {reviewSuccess && <div className={styles.success}>{reviewSuccess}</div>}
                <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
                  <input
                    className={styles.input}
                    placeholder="Title"
                    value={reviewForm.ReviewTitle}
                    onChange={e => setReviewForm({ ...reviewForm, ReviewTitle: e.target.value })}
                  />
                  <textarea
                    className={styles.textarea}
                    placeholder="Share your experience..."
                    rows={4}
                    value={reviewForm.ReviewContent}
                    onChange={e => setReviewForm({ ...reviewForm, ReviewContent: e.target.value })}
                  />
                  <div className={styles.ratingsGrid}>
                    {[
                      ['OverallRating', 'Overall *'],
                      ['Cleanliness', 'Cleanliness'],
                      ['Service', 'Service'],
                      ['SleepQuality', 'Sleep Quality'],
                      ['Location', 'Location'],
                      ['Rooms', 'Rooms'],
                    ].map(([key, label]) => (
                      <div key={key} className={styles.ratingField}>
                        <label className={styles.ratingLabel}>{label}</label>
                        <select
                          className={styles.select}
                          value={reviewForm[key]}
                          onChange={e => setReviewForm({ ...reviewForm, [key]: e.target.value })}
                        >
                          <option value="">-</option>
                          {[1, 2, 3, 4, 5].map(n => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                    <div className={styles.ratingField}>
                      <label className={styles.ratingLabel}>Trip Type</label>
                      <select
                        className={styles.select}
                        value={reviewForm.TripType}
                        onChange={e => setReviewForm({ ...reviewForm, TripType: e.target.value })}
                      >
                        <option value="">-</option>
                        {['Business', 'Couples', 'Family', 'Solo', 'Friends'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={styles.submitBtn}
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}