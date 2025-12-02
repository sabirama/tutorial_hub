import { useEffect, useState } from 'react';
import "../../../../../assets/css/TutorParents.css"
import { getToken, getUserId } from '../../../../../middlewares/auth/auth';
import apiCall from '../../../../../middlewares/api/axios';
import { useNavigate } from 'react-router-dom';

const TutorParents = () => {
      const navigate = useNavigate();

    if(!sessionStorage.getItem("token")) {
       navigate('/');
    }
    

  const [activeTab, setActiveTab] = useState('current');
  const [ratingModal, setRatingModal] = useState({ isOpen: false, parent: null });
  const [sessionModal, setSessionModal] = useState({ isOpen: false, parent: null });
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const [children, setChildren] = useState([]);
  const [tutorSubjects, setTutorSubjects] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchParents() {
      try {
        const response = await apiCall({
          method: 'get',
          url: `/tutors/${getUserId()}/parents`,
          headers: {
            token: getToken()
          }
        });
        
        if (response.data.success) {
          const transformedParents = response.data.data.map(parent => ({
            id: parent.id,
            parent_id: parent.parent_id,
            name: parent.parent_name || 'Parent',
            email: parent.parent_email || 'No email',
            contact: parent.parent_contact || 'No contact provided',
            location: parent.parent_location || 'Location not specified',
            status: parent.status || 'active',
            joinDate: parent.created_at,
            totalSessions: parent.total_sessions || parent.session_count || 0,
            children: parent.children || [],
            my_rating: parent.rating,
            my_review: parent.review,
            lastSession: parent.last_session_date,
            subject_name: parent.subject_name,
            subject_description: parent.subject_description,
            hourly_rate: parent.hourly_rate || '0'
          }));
          
          setParents(transformedParents);
        }
      } catch (error) {
        console.error('Error fetching parents:', error);
        setParents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchParents();
  }, []);

  const filteredParents = parents.filter(parent => {
    if (!parent) return false;
    if (activeTab === 'current') return parent.status === 'active';
    if (activeTab === 'past') return parent.status === 'inactive';
    return true;
  });

  const handleRateParent = (parent) => {
    setRatingModal({ isOpen: true, parent });
    setRatingForm({
      rating: parent.my_rating || 0,
      review: parent.my_review || '',
      would_recommend: parent.would_recommend !== false
    });
  };

  const handleScheduleSession = async (parent) => {
    setSessionModal({ isOpen: true, parent });

    // Fetch children and subjects when modal opens
    try {
      const tutorId = getUserId();

      // Fetch children for this parent
      let childrenData = [];
      try {
        const childrenResponse = await apiCall({
          method: 'get',
          url: `/parents/${parent.parent_id}/children`,
          headers: {
            token: getToken()
          }
        });
        childrenData = childrenResponse.data?.data || childrenResponse.data || [];
      } catch (error) {
        console.log('Could not fetch children:', error);
      }
      setChildren(childrenData);

      // Fetch tutor's offered subjects
      let tutorSubjectsData = [];
      try {
        const tutorSubjectsResponse = await apiCall({
          method: 'get',
          url: `/sessions/tutor-subjects/${tutorId}`,
          headers: {
            token: getToken()
          }
        });
        tutorSubjectsData = tutorSubjectsResponse.data?.data || tutorSubjectsResponse.data || [];
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
      message: `Hi ${parent.name}, I'd like to schedule another tutoring session.`
    });
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();

    try {
      const response = await apiCall({
        method: 'post',
        url: '/parent-ratings',
        data: {
          tutor_id: getUserId(),
          parent_id: ratingModal.parent.parent_id,
          rating: ratingForm.rating,
          review: ratingForm.review,
        },
        headers: {
          token: getToken()
        }
      });

      if (response.data.success) {
        // Update local state
        setParents(prev => prev.map(parent =>
          parent.parent_id === ratingModal.parent.parent_id
            ? {
                ...parent,
                my_rating: ratingForm.rating,
                my_review: ratingForm.review,
              }
            : parent
        ));

        setRatingModal({ isOpen: false, parent: null });
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
      const sessionData = {
        parent_id: sessionModal.parent.parent_id,
        tutor_id: getUserId(),
        child_id: sessionForm.childId || 1,
        subject_id: sessionForm.subjectId || 1,
        date: sessionForm.preferredDate,
        time: sessionForm.preferredTime,
        status: 'pending',
        location: 'Online',
        notes: sessionForm.message,
        hourly_rate: sessionModal.parent?.hourly_rate ? `${sessionModal.parent.hourly_rate}` : '0',
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
        const parentName = sessionModal.parent?.name;
        alert(`Session request sent to ${parentName}! They will confirm soon.`);
        setSessionModal({ isOpen: false, parent: null });
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
      case 'inactive': return 'Past Parent';
      case 'pending': return 'Session Requested';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="tutor-parents">
        <div className="page-header">
          <h1>My Parents & Students</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tutor-parents">
      <div className="page-header">
        <h1>My Parents & Students</h1>
        <p>Manage and review the parents and students you're tutoring</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'current' ? 'active' : ''}`}
          onClick={() => setActiveTab('current')}
        >
          Current Parents ({parents.filter(p => p?.status === 'active').length})
        </button>
        <button
          className={`tab ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Past Parents ({parents.filter(p => p?.status === 'inactive').length})
        </button>
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Parents ({parents.length})
        </button>
      </div>

      {/* Parents Grid */}
      <div className="parents-grid">
        {filteredParents.length === 0 ? (
          <div className="no-parents">
            <p>No parents found matching the selected filter.</p>
          </div>
        ) : (
          filteredParents.map(parent => (
            <div key={parent.id} className="parent-card">
              <div className="parent-header">
                <div className="parent-info">
                  <div className="avatar">
                    {parent.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3>{parent.name}</h3>
                    <p>{parent.location}</p>
                  </div>
                </div>
                <div className="parent-stats">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(parent.status) }}
                  >
                    {getStatusText(parent.status)}
                  </span>
                  <span className="sessions-count">{parent.totalSessions} sessions</span>
                </div>
              </div>

              <div className="parent-details">
                <div className="detail-item">
                  <span className="label">Subject:</span>
                  <span className="value">{parent.subject_name || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Hourly Rate:</span>
                  <span className="value">${parent.hourly_rate || '0'}/hour</span>
                </div>
                <div className="detail-item">
                  <span className="label">Relationship Created:</span>
                  <span className="value">{new Date(parent.joinDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="contact-info">
                <div className="contact-item">
                  <span>📧</span>
                  <span>{parent.email}</span>
                </div>
                <div className="contact-item">
                  <span>📞</span>
                  <span>{parent.contact}</span>
                </div>
              </div>

              {parent.children && parent.children.length > 0 && (
                <div className="children-section">
                  <h4>Students ({parent.children.length}):</h4>
                  <div className="children-list">
                    {parent.children.map(child => (
                      <div key={child.id} className="child-tag">
                        <strong>{child.name}</strong> - {child.grade || 'Not specified'}
                        {child.sessions > 0 && <span className="child-sessions"> ({child.sessions} sessions)</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {parent.my_review && (
                <div className="my-review-section">
                  <h4>Your Review:</h4>
                  <div className="review-content">
                    {renderStars(parent.my_rating)}
                    <p>{parent.my_review}</p>
                    {parent.would_recommend && (
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
                  onClick={() => handleRateParent(parent)}
                >
                  {parent.my_rating ? 'Update Rating' : 'Rate Parent'}
                </button>
                <button className="message-btn">
                  Message
                </button>
                {parent.status === 'active' && (
                  <button 
                    className="schedule-btn"
                    onClick={() => handleScheduleSession(parent)}
                  >
                    Schedule Session
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Rating Modal */}
      {ratingModal.isOpen && (
        <div className="modal-overlay">
          <div className="rating-modal">
            <div className="modal-header">
              <h2>Rate {ratingModal.parent?.name}</h2>
              <button
                className="close-btn"
                onClick={() => setRatingModal({ isOpen: false, parent: null })}
              >
                ×
              </button>
            </div>

            <div className="parent-preview">
              <div className="avatar">
                {ratingModal.parent?.name?.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h4>{ratingModal.parent?.name}</h4>
                <p>{ratingModal.parent?.subject_name}</p>
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
                  <span>📞 Communication</span>
                  <span>⏰ Punctuality</span>
                  <span>🤝 Cooperation</span>
                  <span>💳 Payment</span>
                  <span>📈 Progress</span>
                </div>
              </div>

              <div className="review-section-modal">
                <label htmlFor="review">Your Review</label>
                <textarea
                  id="review"
                  value={ratingForm.review}
                  onChange={(e) => setRatingForm(prev => ({ ...prev, review: e.target.value }))}
                  placeholder="Share your experience working with this parent. Consider their communication style, punctuality for sessions, cooperation with learning goals, payment reliability, and their child's progress..."
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
                  <span>I would recommend working with this parent</span>
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setRatingModal({ isOpen: false, parent: null })}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={ratingForm.rating === 0}
                >
                  {ratingModal.parent?.my_rating ? 'Update Rating' : 'Submit Rating'}
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
              <h2>Schedule Session with {sessionModal.parent?.name}</h2>
              <button
                className="close-btn"
                onClick={() => setSessionModal({ isOpen: false, parent: null })}
              >
                ×
              </button>
            </div>

            <div className="parent-preview">
              <div className="avatar">
                {sessionModal.parent?.name?.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h4>{sessionModal.parent?.name}</h4>
                <p>{sessionModal.parent?.subject_name}</p>
                <div className="parent-sessions">
                  <span>{sessionModal.parent?.totalSessions || 0} sessions completed</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitSessionRequest}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="childId">Select Student</label>
                  <select
                    id="childId"
                    value={sessionForm.childId}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, childId: e.target.value }))}
                  >
                    <option value="">Select a student</option>
                    {children.map(child => (
                      <option key={child.id} value={child.id}>
                        {child.name} {child.grade ? `- Grade ${child.grade}` : ''}
                      </option>
                    ))}
                  </select>
                  {children.length === 0 && (
                    <p className="form-help">No students found for this parent.</p>
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
                    <p className="form-help">No subjects available.</p>
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
                  placeholder="Provide details about the session topic, learning objectives, and any specific requirements..."
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setSessionModal({ isOpen: false, parent: null })}
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

export default TutorParents;