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

  // ➕ AM ADĂUGAT: State-uri noi pentru funcționalitățile de editare și adăugare
  const [currentHotelId, setCurrentHotelId] = useState(null);
  const [isAmenityModalOpen, setIsAmenityModalOpen] = useState(false);
  const [newAmenityName, setNewAmenityName] = useState('');
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Bug 1: was using raw axios instead of the configured instance with JWT
        const hotelRes = await axios.get('/api/hotels/my');
        const myHotel  = hotelRes.data;

        // Bug 2: wrong field name — hotel model uses GlobalPropertyName not HotelName
        const hotelId = String(myHotel.GlobalPropertyID || myHotel.globalpropertyid);
        setHotelName(myHotel.GlobalPropertyName || myHotel.globalpropertyname || 'My Hotel');

        // ➕ AM ADĂUGAT: Salvăm ID-ul hotelului în state pentru a-l putea folosi la POST /api/amenities
        setCurrentHotelId(hotelId);

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

  // ➕ AM ADĂUGAT: Funcția care trimite noua facilitate la backend
  const handleAddAmenity = async (e) => {
    e.preventDefault();
    if (!newAmenityName.trim() || !currentHotelId) return;

    try {
      await axios.post('/api/amenities', {
        hotelId: currentHotelId,
        amenityName: newAmenityName
      });
      // Actualizăm lista vizuală direct, fără refresh la pagină
      setAmenities([...amenities, { amenityid: Date.now(), amenityname: newAmenityName }]);
      setIsAmenityModalOpen(false);
      setNewAmenityName('');
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding amenity');
    }
  };

  // ➕ AM ADĂUGAT: Funcția care trimite modificările de preț la backend
  const handleUpdateOffer = async (e) => {
    e.preventDefault();
    if (!editingOffer) return;

    const offerId = editingOffer.OfferID || editingOffer.offerid;
    try {
      await axios.put(`/api/priceoffers/${offerId}`, {
        Category: editingOffer.Category || editingOffer.category,
        PricePerNight: editingOffer.PricePerNight || editingOffer.pricepernight,
        Currency: editingOffer.Currency || editingOffer.currency
      });
      // Actualizăm lista vizuală
      setPriceOffers(priceOffers.map(o => (o.OfferID || o.offerid) === offerId ? editingOffer : o));
      setIsOfferModalOpen(false);
      setEditingOffer(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating offer');
    }
  };

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
            Manager: {user?.firstName } {user?.lastName || ''}
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
                    {/* ➕ AM ADĂUGAT: Evenimentul onClick pentru deschiderea modalului */}
                    <button 
                      className={styles.editButton}
                      onClick={() => {
                        setEditingOffer(offer);
                        setIsOfferModalOpen(true);
                      }}
                    >
                      ✏️ Edit
                    </button>
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
              {/* ➕ AM ADĂUGAT: Evenimentul onClick pentru adăugare */}
              <button 
                className={styles.addButton}
                onClick={() => setIsAmenityModalOpen(true)}
              >
                ➕
              </button>
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

      {/* ➕ AM ADĂUGAT: Ferestrele Modale (Pop-up-urile) la finalul paginii */}
      {isAmenityModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Add Amenity</h2>
            <form onSubmit={handleAddAmenity} className={styles.modalForm}>
              <input 
                type="text" 
                placeholder="e.g. Free Wi-Fi, Pool" 
                className={styles.modalInput}
                value={newAmenityName}
                onChange={(e) => setNewAmenityName(e.target.value)}
                autoFocus
                required
              />
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsAmenityModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.saveBtn}>Save</button>
              </div>
            </form>
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
                type="number" 
                step="0.01"
                className={styles.modalInput}
                value={editingOffer.PricePerNight || editingOffer.pricepernight || ''}
                onChange={(e) => setEditingOffer({...editingOffer, PricePerNight: e.target.value})}
                required
              />
              
              <label className={styles.modalLabel}>Currency</label>
              <input 
                type="text" 
                className={styles.modalInput}
                value={editingOffer.Currency || editingOffer.currency || ''}
                onChange={(e) => setEditingOffer({...editingOffer, Currency: e.target.value.toUpperCase()})}
                required
              />

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsOfferModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.saveBtn}>Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}