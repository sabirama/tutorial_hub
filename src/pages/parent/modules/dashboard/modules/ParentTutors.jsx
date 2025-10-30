import { useState } from 'react';
import "../../../../../assets/css/ParentTutors.css"
const ParentTutors = () => {
  const [activeTab, setActiveTab] = useState('current');
  const [ratingModal, setRatingModal] = useState({ isOpen: false, tutor: null });

  const [tutors, setTutors] = useState([
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@email.com',
      contact: '(555) 123-4567',
      location: 'New York, NY',
      subjects: ['Mathematics', 'Algebra', 'Calculus'],
      hourlyRate: '$35',
      experience: '5 years',
      education: 'BS Mathematics, University of California',
      rating: 4.8,
      myRating: 5,
      myReview: 'Excellent tutor! My children improved significantly in math.',
      totalSessions: 24,
      activeSessions: 2,
      status: 'active',
      joinDate: '2023-01-15',
      lastSession: '2024-01-15'
    },
    {
      id: 2,
      name: 'Maria Garcia',
      email: 'maria.g@email.com',
      contact: '(555) 234-5678',
      location: 'San Francisco, CA',
      subjects: ['Physics', 'Chemistry'],
      hourlyRate: '$40',
      experience: '3 years',
      education: 'MS Physics, Stanford University',
      rating: 4.9,
      myRating: null,
      myReview: null,
      totalSessions: 18,
      activeSessions: 1,
      status: 'active',
      joinDate: '2023-02-20',
      lastSession: '2024-01-14'
    },
    {
      id: 3,
      name: 'David Kim',
      email: 'david.kim@email.com',
      contact: '(555) 345-6789',
      location: 'Chicago, IL',
      subjects: ['Computer Science', 'Programming'],
      hourlyRate: '$45',
      experience: '4 years',
      education: 'BS Computer Science, MIT',
      rating: 4.7,
      myRating: 4,
      myReview: 'Very knowledgeable and patient with my son.',
      totalSessions: 12,
      activeSessions: 0,
      status: 'inactive',
      joinDate: '2023-03-10',
      lastSession: '2023-12-20'
    },
    {
      id: 4,
      name: 'Sarah Williams',
      email: 'sarah.w@email.com',
      contact: '(555) 456-7890',
      location: 'Boston, MA',
      subjects: ['English', 'Literature'],
      hourlyRate: '$30',
      experience: '2 years',
      education: 'BA English, Harvard University',
      rating: 4.5,
      myRating: null,
      myReview: null,
      totalSessions: 8,
      activeSessions: 0,
      status: 'pending',
      joinDate: '2023-04-05',
      lastSession: '2023-11-15'
    }
  ]);

  const [ratingForm, setRatingForm] = useState({
    rating: 0,
    review: '',
    wouldRecommend: true
  });

  const filteredTutors = tutors.filter(tutor => {
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
            rating: ((tutor.rating * (tutor.totalSessions - 1)) + ratingForm.rating) / tutor.totalSessions
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
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={interactive ? () => onStarClick(star) : null}
          >
            {star <= rating ? '★' : '☆'}
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
          Current Tutors ({tutors.filter(t => t.status === 'active').length})
        </button>
        <button 
          className={`tab ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Past Tutors ({tutors.filter(t => t.status === 'inactive').length})
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
        {filteredTutors.map(tutor => (
          <div key={tutor.id} className="tutor-card">
            <div className="tutor-header">
              <div className="tutor-info">
                <div className="avatar">
                  {tutor.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3>{tutor.name}</h3>
                  <p>{tutor.location}</p>
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
                  {renderStars(tutor.rating)}
                  <span className="rating-value">({tutor.rating})</span>
                </div>
              </div>
            </div>

            <div className="tutor-details">
              <div className="detail-item">
                <span className="label">Hourly Rate:</span>
                <span className="value">{tutor.hourlyRate}</span>
              </div>
              <div className="detail-item">
                <span className="label">Experience:</span>
                <span className="value">{tutor.experience}</span>
              </div>
              <div className="detail-item">
                <span className="label">Education:</span>
                <span className="value">{tutor.education}</span>
              </div>
              <div className="detail-item">
                <span className="label">Total Sessions:</span>
                <span className="value">{tutor.totalSessions}</span>
              </div>
            </div>

            <div className="subjects-section">
              <h4>Subjects:</h4>
              <div className="subjects-list">
                {tutor.subjects.map((subject, index) => (
                  <span key={index} className="subject-tag">
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            <div className="contact-info">
              <div className="contact-item">
                <span>📧</span>
                <span>{tutor.email}</span>
              </div>
              <div className="contact-item">
                <span>📞</span>
                <span>{tutor.contact}</span>
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
        ))}
      </div>

      {/* Rating Modal */}
      {ratingModal.isOpen && (
        <div className="modal-overlay">
          <div className="rating-modal">
            <div className="modal-header">
              <h2>Rate {ratingModal.tutor?.name}</h2>
              <button 
                className="close-btn"
                onClick={() => setRatingModal({ isOpen: false, tutor: null })}
              >
                ×
              </button>
            </div>

            <div className="tutor-preview">
              <div className="avatar">
                {ratingModal.tutor?.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h4>{ratingModal.tutor?.name}</h4>
                <p>{ratingModal.tutor?.subjects.join(', ')}</p>
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