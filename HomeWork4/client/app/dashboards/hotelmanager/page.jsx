'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from '../../../lib/axios';
import styles from './manager.module.css';

export default function ManagerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [hotelName, setHotelName] = useState('');
  const [priceOffers, setPriceOffers] = useState([]);
  const [amenities, setAmenities]     = useState([]);
  const [reviews, setReviews]         = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Bug 1: was using raw axios instead of the configured instance with JWT
        const hotelRes = await axios.get('/api/hotels/my');
        const myHotel  = hotelRes.data;

        // Bug 2: wrong field name — hotel model uses GlobalPropertyName not HotelName
        const hotelId = String(myHotel.GlobalPropertyID || myHotel.globalpropertyid);
        setHotelName(myHotel.GlobalPropertyName || myHotel.globalpropertyname || 'My Hotel');

        const [offersRes, amenitiesRes, reviewsRes] = await Promise.all([
          axios.get(`/api/priceoffers/${hotelId}`).catch(() => ({ data: { offers: [] } })),
          axios.get(`/api/amenities/${hotelId}`).catch(() => ({ data: { amenities: [] } })),
          axios.get(`/api/reviews/${hotelId}`).catch(() => ({ data: [] })),
        ]);

        // Bug 3: priceoffers endpoint returns { offers: [...] } not a flat array
        setPriceOffers(offersRes.data?.offers || []);

        // Bug 4: amenities endpoint returns { amenities: [...] } not a flat array
        setAmenities(amenitiesRes.data?.amenities || []);

        setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);

      } catch (err) {
        console.error('Error loading data:', err);
        setError('No hotel associated with this manager.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) return <div className={styles.loaderPage}>Loading...</div>;
  if (error)     return <div className={styles.errorPage}>{error}</div>;

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, curr) => acc + parseFloat(curr.OverallRating || curr.overallrating || 0), 0) / reviews.length).toFixed(1)
    : 0;

  const renderStars = (rating) => {
    if (!rating || rating == 0) return 'No reviews yet';
    const r = Math.round(rating);
    return '★'.repeat(r) + '☆'.repeat(5 - r);
  };

  return (
    <div className={styles.dashboardContainer}>

      <header className={styles.header}>
        <h1 className={styles.hotelName}>{hotelName}</h1>
        <div className={styles.managerInfo}>
          <span className={styles.managerName}>
            {user?.firstName || 'Manager'} {user?.lastName || ''}
          </span>
          <button onClick={() => { logout(); router.push('/login'); }} className={styles.logoutButton}>
             Logout
          </button>
        </div>
      </header>

      <div className={styles.mainGrid}>

        <div className={styles.leftColumn}>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Price Offers</h2>
              <span className={styles.columnLabel}>Price / night</span>
            </div>
            <ul className={styles.list}>
              {priceOffers.length > 0 ? priceOffers.map((offer) => (
                <li key={offer.OfferID || offer.offerid} className={styles.listItem}>
                  <div className={styles.itemLeft}>
                    <span className={styles.bullet}>•</span>
                    {/* Bug 5: field is Category not RoomType */}
                    <span className={styles.itemText}>{offer.Category || offer.category}</span>
                  </div>
                  <div className={styles.itemRight}>
                    <span className={styles.priceText}>
                      {offer.PricePerNight || offer.pricepernight} {offer.Currency || offer.currency || 'USD'}
                    </span>
                    <button className={styles.editButton}>✏️ Edit</button>
                  </div>
                </li>
              )) : (
                <li className={styles.listItem}>No offers set.</li>
              )}
            </ul>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Amenities</h2>
              <button className={styles.addButton}>➕</button>
            </div>
            <ul className={styles.amenitiesGrid}>
              {amenities.length > 0 ? amenities.map((amenity) => (
                // Bug 6: field is amenityname (lowercase) from the controller
                <li key={amenity.amenityid} className={styles.amenityItem}>
                  {amenity.amenityname}
                </li>
              )) : (
                <li className={styles.amenityItem}>No amenities added.</li>
              )}
            </ul>
          </div>

        </div>

        <div className={styles.rightColumn}>

          <div className={styles.card}>
            <div className={styles.ratingSection}>
              <h2 className={styles.cardTitle}>
                Rating: {averageRating > 0 ? `${averageRating}/5` : 'N/A'}
              </h2>
              <div className={styles.stars}>{renderStars(averageRating)}</div>
            </div>

            <div className={styles.reviewsHeader}>
              <h3 className={styles.reviewsTitle}>Reviews ({reviews.length})</h3>
            </div>

            <div className={styles.reviewsContainer}>
              {reviews.length > 0 ? reviews.map((review) => (
                <div key={review.ReviewID || review.reviewid} className={styles.reviewBox}>
                  <div className={styles.reviewBoxHeader}>
                    <span className={styles.reviewText}>
                      "{(review.ReviewContent || review.reviewcontent || '').substring(0, 100)}..."
                    </span>
                    <span className={styles.reviewScore}>
                      {review.OverallRating || review.overallrating}
                    </span>
                  </div>
                  <div className={styles.reviewAuthor}>
                    — {review.ReviewerName || review.reviewername || 'Anonymous'}
                  </div>
                </div>
              )) : (
                <p className={styles.noReviews}>No reviews yet.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}