import { useEffect, useState } from 'react';
import "../../../../../assets/css/ParentTutors.css"
import apiCall from '../../../../../middlewares/api/axios';
import { getUserId } from '../../../../../middlewares/auth/auth';

const ParentTutors = () => {
  const [activeTab, setActiveTab] = useState('current');
  const [ratingModal, setRatingModal] = useState({ isOpen: false, tutor: null });
  const [ratingForm, setRatingForm] = useState({
    rating: 0,
    review: '',
    wouldRecommend: true
  });

  const [tutors, setTutors] = useState([]);

  useEffect(() => {
    async function fetchTutors() {
      try {
        const response = await apiCall({
          method: 'get',
          url: `/parents/${getUserId()}/tutors`,
        });
        setTutors(response.data.data || []);
      } catch (error) {
        console.error('Error fetching tutors:', error);
        setTutors([]);
      } 
    }

    fetchTutors();
  }, []);

  const filteredTutors = tutors.filter(tutor => {
    if (!tutor) return false;
    if (activeTab === 'current') return tutor.status === 'active';
    if (activeTab === 'past') return tutor.status === 'inactive';
    return true;
  });

  const handleRateTutor = (tutor) => {
    setRatingModal({ isOpen: true, tutor });
    setRatingForm({
      rating: tutor.myRating || 0,
      review: tutor.myReview || '',
      wouldRecommend: true
    });
  };

  const handleSubmitRating = (e) => {
    e.preventDefault();

    setTutors(prev => prev.map(tutor =>
      tutor.id === ratingModal.tutor.id
        ? {
          ...tutor,
          myRating: ratingForm.rating,
          myReview: ratingForm.review,
        }
        : tutor
    ));

    setRatingModal({ isOpen: false, tutor: null });
    setRatingForm({ rating: 0, review: '', wouldRecommend: true });
  };

  const handleRatingChange = (newRating) => {
    setRatingForm(prev => ({ ...prev, rating: newRating }));
  };

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    const numericRating = parseFloat(rating) || 0;
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= numericRating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={interactive ? () => onStarClick(star) : null}
          >
            {star <= numericRating ? '★' : '☆'}
          </span>
        ))}
      </div>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b759';
      case 'inactive': return '#6c757d';
      case 'pending': return '#f59e0b';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Currently Tutoring';
      case 'inactive': return 'Past Tutor';
      case 'pending': return 'Session Requested';
      default: return status;
    }
  };

  return (
    <div className="parent-tutors">
      <div className="page-header">
        <h1>My Tutors</h1>
        <p>View and rate the tutors working with your children</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'current' ? 'active' : ''}`}
          onClick={() => setActiveTab('current')}
        >
          Current Tutors ({tutors.filter(t => t?.status === 'active').length})
        </button>
        <button
          className={`tab ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Past Tutors ({tutors.filter(t => t?.status === 'inactive').length})
        </button>
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Tutors ({tutors.length})
        </button>
      </div>

      {/* Tutors Grid */}
      <div className="tutors-grid">
        {filteredTutors.map(tutor => {
          // Use the actual API response data structure
          const tutorName = tutor.tutor_name || 'Unknown Tutor';
          const tutorLocation = tutor.tutor_location || 'Location not specified';
          const tutorRating = tutor.tutor_rating || 0;
          const tutorEmail = tutor.tutor_email || 'No email';
          const tutorContact = tutor.tutor_contact || 'No contact';
          const tutorSubjects = [tutor.subject_name].filter(Boolean); // Single subject from API

          return (
            <div key={tutor.id} className="tutor-card">
              <div className="tutor-header">
                <div className="tutor-info">
                  <div className="avatar">
                    {tutorName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3>{tutorName}</h3>
                    <p>{tutorLocation}</p>
                  </div>
                </div>
                <div className="tutor-stats">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(tutor.status) }}
                  >
                    {getStatusText(tutor.status)}
                  </span>
                  <div className="rating-display">
                    {renderStars(tutorRating)}
                    <span className="rating-value">({tutorRating})</span>
                  </div>
                </div>
              </div>

              <div className="tutor-details">
                <div className="detail-item">
                  <span className="label">Subject:</span>
                  <span className="value">{tutor.subject_name}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Course:</span>
                  <span className="value">{tutor.tutor_course || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Relationship Created:</span>
                  <span className="value">{new Date(tutor.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="subjects-section">
                <h4>Subject:</h4>
                <div className="subjects-list">
                  {tutorSubjects.map((subject, index) => (
                    <span key={index} className="subject-tag">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>

              <div className="contact-info">
                <div className="contact-item">
                  <span>📧</span>
                  <span>{tutorEmail}</span>
                </div>
                <div className="contact-item">
                  <span>📞</span>
                  <span>{tutorContact}</span>
                </div>
              </div>

              {tutor.myReview && (
                <div className="my-review-section">
                  <h4>Your Review:</h4>
                  <div className="review-content">
                    {renderStars(tutor.myRating)}
                    <p>{tutor.myReview}</p>
                  </div>
                </div>
              )}

              <div className="card-actions">
                <button
                  className="rate-btn"
                  onClick={() => handleRateTutor(tutor)}
                >
                  {tutor.myRating ? 'Update Rating' : 'Rate Tutor'}
                </button>
                <button className="message-btn">
                  Message
                </button>
                {tutor.status === 'active' && (
                  <button className="schedule-btn">
                    Schedule Session
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rating Modal */}
      {ratingModal.isOpen && (
        <div className="modal-overlay">
          <div className="rating-modal">
            <div className="modal-header">
              <h2>Rate {ratingModal.tutor?.tutor_name}</h2>
              <button
                className="close-btn"
                onClick={() => setRatingModal({ isOpen: false, tutor: null })}
              >
                ×
              </button>
            </div>

            <div className="tutor-preview">
              <div className="avatar">
                {ratingModal.tutor?.tutor_name?.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h4>{ratingModal.tutor?.tutor_name}</h4>
                <p>{ratingModal.tutor?.subject_name}</p>
              </div>
            </div>

            <form onSubmit={handleSubmitRating}>
              <div className="rating-section">
                <label>Overall Rating</label>
                <div className="interactive-stars">
                  {renderStars(ratingForm.rating, true, handleRatingChange)}
                  <span className="rating-text">
                    {ratingForm.rating === 0 ? 'Select rating' : `${ratingForm.rating}/5 stars`}
                  </span>
                </div>
              </div>

              <div className="rating-criteria">
                <h5>Rate on:</h5>
                <div className="criteria-list">
                  <span>📚 Teaching Quality</span>
                  <span>⏰ Punctuality</span>
                  <span>💬 Communication</span>
                  <span>😊 Patience</span>
                  <span>📈 Results</span>
                </div>
              </div>

              <div className="review-section-modal">
                <label htmlFor="review">Your Review</label>
                <textarea
                  id="review"
                  value={ratingForm.review}
                  onChange={(e) => setRatingForm(prev => ({ ...prev, review: e.target.value }))}
                  placeholder="Share your experience with this tutor. Consider their teaching style, communication, punctuality, and your child's progress..."
                  rows="5"
                />
              </div>

              <div className="recommend-section">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={ratingForm.wouldRecommend}
                    onChange={(e) => setRatingForm(prev => ({ ...prev, wouldRecommend: e.target.checked }))}
                  />
                  <span>I would recommend this tutor to other parents</span>
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setRatingModal({ isOpen: false, tutor: null })}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={ratingForm.rating === 0}
                >
                  {ratingModal.tutor?.myRating ? 'Update Rating' : 'Submit Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentTutors;