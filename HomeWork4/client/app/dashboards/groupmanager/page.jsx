'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from '../../../lib/axios';
import styles from './groupmanager.module.css';

export default function GroupManagerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [groupName, setGroupName]     = useState('');
  const [hotels, setHotels]           = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [managers, setManagers]       = useState({});

  const [priceOffers, setPriceOffers] = useState([]);
  const [amenities, setAmenities]     = useState([]);
  const [reviews, setReviews]         = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [editingOffer, setEditingOffer]         = useState(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState('');
  const tabRefs = useRef([]);

  // Load group on mount
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const groupRes  = await axios.get('/api/hotels/my-group');
        const groupData = groupRes.data;
        setGroupName(groupData.group?.groupName || groupData.group?.groupname || '');
        setHotels(groupData.hotels || []);

        const mgrMap = {};
        try {
          const managersRes = await axios.get('/api/hotels/my-group/managers');
          (managersRes.data?.managers || []).forEach(m => {
            mgrMap[String(m.hotelId)] = m.manager;
          });
        } catch (mgrErr) {
          console.warn('Could not load managers:', mgrErr.response?.data?.message);
        }
        setManagers(mgrMap);

      } catch (err) {
        console.error('Error loading group:', err.response?.data || err.message);
        setError(`Failed to load group data: ${err.response?.data?.message || err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGroup();
  }, []);

  // Scroll tab in view
  useEffect(() => {
    const tab = tabRefs.current[selectedIdx];
    if (tab) {
      tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [selectedIdx]);

  // Load hotel detail when tab changes
  useEffect(() => {
    if (hotels.length === 0) return;
    const hotel   = hotels[selectedIdx];
    const hotelId = String(hotel.GlobalPropertyID || hotel.globalpropertyid);

    setLoadingDetail(true);
    setPriceOffers([]);
    setAmenities([]);
    setReviews([]);

    Promise.all([
      axios.get(`/api/priceoffers/${hotelId}`).catch(() => ({ data: { offers: [] } })),
      axios.get(`/api/amenities/${hotelId}`).catch(() => ({ data: { amenities: [] } })),
      axios.get(`/api/reviews/${hotelId}`).catch(() => ({ data: [] })),
    ]).then(([offersRes, amenitiesRes, reviewsRes]) => {
      setPriceOffers(offersRes.data?.offers || []);
      setAmenities(amenitiesRes.data?.amenities || []);
      setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
    }).finally(() => setLoadingDetail(false));
  }, [selectedIdx, hotels]);

  // Edit offer
  const handleUpdateOffer = async (e) => {
    e.preventDefault();
    if (!editingOffer) return;
    const offerId = editingOffer.OfferID || editingOffer.offerid;
    try {
      await axios.put(`/api/priceoffers/${offerId}`, {
        Category:      editingOffer.Category      || editingOffer.category,
        PricePerNight: editingOffer.PricePerNight || editingOffer.pricepernight,
        Currency:      editingOffer.Currency      || editingOffer.currency,
      });
      setPriceOffers(prev => prev.map(o =>
        (o.OfferID || o.offerid) === offerId ? { ...o, ...editingOffer } : o
      ));
      setIsOfferModalOpen(false);
      setEditingOffer(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating offer.');
    }
  };

  if (isLoading) return <div className={styles.loaderPage}>Loading group data...</div>;
  if (error)     return <div className={styles.errorPage}>{error}</div>;
  if (hotels.length === 0) return <div className={styles.errorPage}>No hotels found in your group.</div>;

  const selectedHotel = hotels[selectedIdx];
  const hotelId       = String(selectedHotel.GlobalPropertyID || selectedHotel.globalpropertyid);
  const hotelManager  = managers[hotelId] || null;
  const hotelName     = (h) => h.GlobalPropertyName || h.globalpropertyname || 'Hotel';

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + parseFloat(r.OverallRating || r.overallrating || 0), 0) / reviews.length).toFixed(1)
    : 0;

  const renderStars = (rating) => {
    if (!rating || Number(rating) === 0) return 'No reviews yet';
    const r = Math.round(Number(rating));
    return '★'.repeat(r) + '☆'.repeat(5 - r);
  };

  return (
    <div className={styles.dashboardContainer}>

      <header className={styles.header}>
        <div className={styles.hotelTabs}>
          <button
            className={styles.arrowBtn}
            onClick={() => setSelectedIdx(i => Math.max(0, i - 1))}
            disabled={selectedIdx === 0}
          >◀</button>

          <div className={styles.tabsScroll}>
            {hotels.map((h, idx) => (
              <button
                key={h.GlobalPropertyID || h.globalpropertyid}
                ref={el => tabRefs.current[idx] = el}
                className={`${styles.hotelTab} ${idx === selectedIdx ? styles.hotelTabActive : ''}`}
                onClick={() => setSelectedIdx(idx)}
              >
                {hotelName(h)}
              </button>
            ))}
          </div>

          <button
            className={styles.arrowBtn}
            onClick={() => setSelectedIdx(i => Math.min(hotels.length - 1, i + 1))}
            disabled={selectedIdx === hotels.length - 1}
          >▶</button>
        </div>

        <div className={styles.managerInfo}>
          {groupName && <span className={styles.groupLabel}>{groupName}</span>}
          <span className={styles.managerName}>{user?.firstName} {user?.lastName}</span>
          <button className={styles.logoutButton} onClick={() => { logout(); router.push('/login'); }}>
            Logout
          </button>
        </div>
      </header>

      {loadingDetail ? (
        <div className={styles.loadingDetail}>Loading hotel data...</div>
      ) : (
        <div className={styles.mainGrid}>

          {/* LEFT COLUMN */}
          <div className={styles.leftColumn}>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Price Offers</h2>
                <span className={styles.columnLabel}>Price/night</span>
              </div>
              <ul className={styles.list}>
                {priceOffers.length > 0 ? priceOffers.map(offer => (
                  <li key={offer.OfferID || offer.offerid} className={styles.listItem}>
                    <div className={styles.itemLeft}>
                      <span className={styles.bullet}>•</span>
                      <span className={styles.itemText}>{offer.Category || offer.category}</span>
                    </div>
                    <div className={styles.itemRight}>
                      <span className={styles.priceText}>
                        {(offer.PricePerNight || offer.pricepernight)
                          ? `${offer.PricePerNight || offer.pricepernight} ${offer.Currency || offer.currency || 'USD'}`
                          : '— —'}
                      </span>
                      <button
                        className={styles.editButton}
                        onClick={() => { setEditingOffer(offer); setIsOfferModalOpen(true); }}
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  </li>
                )) : <li className={styles.listItem}>No offers set.</li>}
              </ul>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Amenities</h2>
                <span className={styles.columnLabel}>{amenities.length} total</span>
              </div>
              <ul className={styles.amenitiesGrid}>
                {amenities.length > 0 ? amenities.map(a => (
                  <li key={a.amenityid} className={styles.amenityItem}>{a.amenityname}</li>
                )) : <li className={styles.amenityItem}>No amenities listed.</li>}
              </ul>
            </div>

            <div className={styles.card}>
              <h3 className={styles.managerCardTitle}>Hotel Manager</h3>
              {hotelManager ? (
                <div className={styles.managerCard}>
                  <div className={styles.managerAvatar}>
                    {(hotelManager.firstName || hotelManager.firstname || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className={styles.managerCardName}>
                      {hotelManager.firstName || hotelManager.firstname}{' '}
                      {hotelManager.lastName  || hotelManager.lastname}
                    </p>
                    <p className={styles.managerCardEmail}>{hotelManager.email}</p>
                  </div>
                </div>
              ) : (
                <p className={styles.noManager}>No manager assigned to this hotel.</p>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className={styles.rightColumn}>

            <div className={styles.card}>
              <div className={styles.ratingSection}>
                <h2 className={styles.cardTitle}>
                  Rating: {averageRating > 0 ? `${averageRating}/5` : 'N/A'}
                </h2>
                <div className={styles.stars}>{renderStars(averageRating)}</div>
              </div>

              <div className={styles.reviewsHeader}>
                <h3 className={styles.reviewsTitle}>Reviews</h3>
                <span className={styles.scrollArrow}>▲</span>
              </div>

              <div className={styles.reviewsContainer}>
                {reviews.length > 0 ? reviews.map(review => (
                  <div key={review.ReviewID || review.reviewid} className={styles.reviewBox}>
                    <div className={styles.reviewBoxHeader}>
                      <span className={styles.reviewText}>
                        "{(review.ReviewContent || review.reviewcontent || '').substring(0, 100)}..."
                      </span>
                      <span className={styles.reviewScore}>{review.OverallRating || review.overallrating}</span>
                    </div>
                    <div className={styles.reviewAuthor}>
                      — {review.ReviewerName || review.reviewername || 'Anonymous'}
                    </div>
                  </div>
                )) : <p className={styles.noReviews}>No reviews yet.</p>}
              </div>
              <div className={styles.scrollArrowBottom}>▼</div>
            </div>

            

          </div>
        </div>
      )}

      {isOfferModalOpen && editingOffer && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Edit {editingOffer.Category || editingOffer.category}</h2>
            <form onSubmit={handleUpdateOffer} className={styles.modalForm}>
              <label className={styles.modalLabel}>Price per night</label>
              <input
                type="number" step="0.01"
                className={styles.modalInput}
                value={editingOffer.PricePerNight || editingOffer.pricepernight || ''}
                onChange={e => setEditingOffer({ ...editingOffer, PricePerNight: e.target.value })}
                required
              />
              <label className={styles.modalLabel}>Currency</label>
              <input
                type="text"
                className={styles.modalInput}
                value={editingOffer.Currency || editingOffer.currency || ''}
                onChange={e => setEditingOffer({ ...editingOffer, Currency: e.target.value.toUpperCase() })}
                required
              />
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn}
                  onClick={() => { setIsOfferModalOpen(false); setEditingOffer(null); }}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn}>Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}