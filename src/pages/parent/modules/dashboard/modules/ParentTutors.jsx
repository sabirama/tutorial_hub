import { useEffect, useState } from 'react';
import "../../../../../assets/css/ParentTutors.css"
import apiCall from '../../../../../middlewares/api/axios';
import { getToken, getUserId } from '../../../../../middlewares/auth/auth';
import { useNavigate } from 'react-router-dom';

const ParentTutors = () => {

  const navigate = useNavigate();

  if (!sessionStorage.getItem("token")) {
    navigate('/');
  }

  const [activeTab, setActiveTab] = useState('current');
  const [ratingModal, setRatingModal] = useState({ isOpen: false, tutor: null });
  const [sessionModal, setSessionModal] = useState({ isOpen: false, tutor: null });
  const [ratingForm, setRatingForm] = useState({
    rating: 0,
    review: '',
    would_recommend: true
  });

  const [sessionForm, setSessionForm] = useState({
    childId: '',
    subjectId: '',
    preferredDate: '',
    preferredTime: '',
    message: ''
  });

  const [tutors, setTutors] = useState([]);
  const [children, setChildren] = useState([]);
  const [tutorSubjects, setTutorSubjects] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchTutors() {
      try {
        const response = await apiCall({
          method: 'get',
          url: `/parents/${getUserId()}/tutors`,
          headers: {
            token: getToken()
          }
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
      rating: tutor.my_rating || 0,
      review: tutor.my_review || '',
      would_recommend: tutor.would_recommend !== false
    });
  };

  const handleScheduleSession = async (tutor) => {
    setSessionModal({ isOpen: true, tutor });

    // Fetch children and tutor's offered subjects when modal opens
    try {
      const userId = getUserId();

      // Try to fetch children
      let childrenData = [];
      try {
        const childrenResponse = await apiCall({
          method: 'get',
          url: `/parents/${userId}/children`,
          headers: {
            token: getToken()
          }
        });
        childrenData = childrenResponse.data?.data || childrenResponse.data || [];
      } catch (error) {
        console.log('Could not fetch children:', error);
      }
      setChildren(childrenData);

      // Fetch tutor's offered subjects from sessions API
      let tutorSubjectsData = [];
      try {
        const tutorSubjectsResponse = await apiCall({
          method: 'get',
          url: `/sessions/tutor-subjects/${tutor.id}`,
          headers: {
            token: getToken()
          }
        });
        tutorSubjectsData = tutorSubjectsResponse.data?.data || tutorSubjectsResponse.data || [];
        console.log('Fetched tutor subjects:', tutorSubjectsData);
      } catch (error) {
        console.log('Could not fetch tutor subjects:', error);
      }
      setTutorSubjects(tutorSubjectsData);

    } catch (error) {
      console.error('Error fetching modal data:', error);
    }

    // Set initial form values
    setSessionForm({
      childId: '',
      subjectId: '',
      preferredDate: '',
      preferredTime: '',
      message: `Hi ${tutor.tutor_name}, I'd like to schedule another tutoring session.`
    });
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();

    try {
      // Submit rating to backend
      const response = await apiCall({
        method: 'post',
        url: '/ratings',
        data: {
          tutor_id: ratingModal.tutor.id,
          parent_id: getUserId(),
          rating: ratingForm.rating,
          review: ratingForm.review,
        },
        headers: {
          token: getToken()
        }
      });

      if (response.data.success) {
        // Update local state
        setTutors(prev => prev.map(tutor =>
          tutor.id === ratingModal.tutor.id
            ? {
              ...tutor,
              my_rating: ratingForm.rating,
              my_review: ratingForm.review,
            }
            : tutor
        ));

        setRatingModal({ isOpen: false, tutor: null });
        setRatingForm({ rating: 0, review: '', would_recommend: true });
        alert('Rating submitted successfully!');
      } else {
        alert('Failed to submit rating: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleSubmitSessionRequest = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create session with pending status - using the correct table structure
      const sessionData = {
        parent_id: getUserId(),
        tutor_id: sessionModal.tutor.id,
        child_id: sessionForm.childId || 1,
        subject_id: sessionForm.subjectId || 1,
        date: sessionForm.preferredDate,
        time: sessionForm.preferredTime,
        status: 'pending',
        location: 'Online',
        notes: sessionForm.message,
        hourly_rate: sessionModal.tutor?.hourlyRate ? `${sessionModal.tutor.hourlyRate}` : '0',
        duration: '1 hour'
      };

      const response = await apiCall({
        method: 'post',
        url: '/sessions',
        data: sessionData,
        headers: {
          token: getToken()
        }
      });

      if (response.data.success) {
        const tutorName = sessionModal.tutor?.tutor_name;
        alert(`Session request sent to ${tutorName}! They will contact you soon.`);
        setSessionModal({ isOpen: false, tutor: null });
        setSessionForm({
          childId: '',
          subjectId: '',
          preferredDate: '',
          preferredTime: '',
          message: ''
        });
      } else {
        alert('Failed to send session request: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to send session request: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsSubmitting(false);
    }
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
          const tutorName = tutor.tutor_name || 'Unknown Tutor';
          const tutorLocation = tutor.tutor_location || 'Location not specified';
          const tutorRating = tutor.tutor_rating || 0;
          const tutorEmail = tutor.tutor_email || 'No email';
          const tutorContact = tutor.tutor_contact || 'No contact';
          const tutorSubjects = [tutor.subject_name].filter(Boolean);

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

              {tutor.my_review && (
                <div className="my-review-section">
                  <h4>Your Review:</h4>
                  <div className="review-content">
                    {renderStars(tutor.my_rating)}
                    <p>{tutor.my_review}</p>
                    {tutor.would_recommend && (
                      <div className="recommendation-badge">
                        ✅ Would recommend
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="card-actions">
                <button
                  className="rate-btn"
                  onClick={() => handleRateTutor(tutor)}
                >
                  {tutor.my_rating ? 'Update Rating' : 'Rate Tutor'}
                </button>
                <button className="message-btn">
                  Message
                </button>
                {tutor.status === 'active' && (
                  <button
                    className="schedule-btn"
                    onClick={() => handleScheduleSession(tutor)}
                  >
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
                <label>Overall Rating *</label>
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
                    checked={ratingForm.would_recommend}
                    onChange={(e) => setRatingForm(prev => ({ ...prev, would_recommend: e.target.checked }))}
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
                  {ratingModal.tutor?.my_rating ? 'Update Rating' : 'Submit Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Session Request Modal */}
      {sessionModal.isOpen && (
        <div className="modal-overlay">
          <div className="contact-modal">
            <div className="modal-header">
              <h2>Request Session with {sessionModal.tutor?.tutor_name}</h2>
              <button
                className="close-btn"
                onClick={() => setSessionModal({ isOpen: false, tutor: null })}
              >
                ×
              </button>
            </div>

            <div className="tutor-preview">
              <div className="avatar">
                {sessionModal.tutor?.tutor_name?.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h4>{sessionModal.tutor?.tutor_name}</h4>
                <p>{sessionModal.tutor?.subject_name}</p>
                <div className="tutor-rating-small">
                  {renderStars(sessionModal.tutor?.tutor_rating)}
                  <span>{parseFloat(sessionModal.tutor?.tutor_rating) || 0}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitSessionRequest}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="childId">Select Child</label>
                  <select
                    id="childId"
                    value={sessionForm.childId}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, childId: e.target.value }))}
                  >
                    <option value="">Select a child</option>
                    {children.map(child => (
                      <option key={child.id} value={child.id}>
                        {child.name} {child.grade ? `- Grade ${child.grade}` : ''}
                      </option>
                    ))}
                  </select>
                  {children.length === 0 && (
                    <p className="form-help">No children found. Please add a child to your profile first.</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <select
                    id="subject"
                    value={sessionForm.subjectId}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, subjectId: e.target.value }))}
                  >
                    <option value="">Select a subject</option>
                    {tutorSubjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.subject}
                      </option>
                    ))}
                  </select>
                  {tutorSubjects.length === 0 && (
                    <p className="form-help">No subjects available for this tutor.</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="preferredDate">Preferred Date *</label>
                  <input
                    type="date"
                    id="preferredDate"
                    value={sessionForm.preferredDate}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, preferredDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="preferredTime">Preferred Time *</label>
                  <select
                    id="preferredTime"
                    value={sessionForm.preferredTime}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, preferredTime: e.target.value }))}
                    required
                  >
                    <option value="">Select a time</option>
                    <option value="08:00">8:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="18:00">6:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">Additional Message *</label>
                <textarea
                  id="message"
                  value={sessionForm.message}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, message: e.target.value }))}
                  rows="4"
                  placeholder="Tell the tutor about your child's learning needs, goals, and any specific requirements..."
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setSessionModal({ isOpen: false, tutor: null })}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Session Request'}
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