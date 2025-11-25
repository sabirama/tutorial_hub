import { useEffect, useState } from 'react';
import "../../../../../assets/css/TutorParents.css"
import { getToken, getUserId } from '../../../../../middlewares/auth/auth';
import apiCall from '../../../../../middlewares/api/axios';

const TutorParents = () => {
  const [activeTab, setActiveTab] = useState('parents');
  const [ratingModal, setRatingModal] = useState({ isOpen: false, parent: null });
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingForm, setRatingForm] = useState({
    rating: 0,
    review: '',
    wouldRecommend: true
  });

  async function getParents() {
    try {
      const response = await apiCall({
        method: 'get',
        url: `/tutors/${getUserId()}/parents`,
        headers: {
          'token': getToken()
        }
      });
      
      if (response.data.success) {
        // Transform API data to match component structure
        const transformedParents = response.data.data.map(parent => ({
          id: parent.id,
          name: parent.parent_name,
          email: parent.parent_email,
          contact: parent.parent_contact,
          location: parent.parent_location,
          joinDate: parent.created_at,
          totalSessions: 0, // You might need to fetch this separately
          children: [
            {
              id: parent.id, // Using parent_tutor id as temporary child id
              name: 'Student Name', // You'll need to fetch actual children data
              grade: 'Grade', // You'll need to fetch actual children data
              age: 'Age', // You'll need to fetch actual children data
              sessions: 0 // You'll need to fetch actual session count
            }
          ],
          rating: parent.rating,
          review: parent.review,
          lastSession: parent.last_session_date,
          subject_name: parent.subject_name,
          subject_description: parent.subject_description
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

  const handleRateParent = async (parent) => {
    setRatingModal({ isOpen: true, parent });
    setRatingForm({
      rating: parent.rating || 0,
      review: parent.review || '',
      wouldRecommend: true
    });
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();

    try {
      // Update parent rating via API
      await apiCall({
        method: 'put',
        url: `/parent-tutors/${ratingModal.parent.id}`,
        data: {
          rating: ratingForm.rating,
          review: ratingForm.review
        },
        headers: {
          'token': getToken()
        }
      });

      // Update local state
      setParents(prev => prev.map(parent =>
        parent.id === ratingModal.parent.id
          ? { ...parent, rating: ratingForm.rating, review: ratingForm.review }
          : parent
      ));

      setRatingModal({ isOpen: false, parent: null });
      setRatingForm({ rating: 0, review: '', wouldRecommend: true });
      alert('Rating submitted successfully!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    }
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

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#10b759';
    if (rating >= 4.0) return '#f59e0b';
    if (rating >= 3.0) return '#f97316';
    return '#ef4444';
  };

  useEffect(() => {
    getParents();
  }, []);

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
          className={`tab ${activeTab === 'parents' ? 'active' : ''}`}
          onClick={() => setActiveTab('parents')}
        >
          Parents ({parents.length})
        </button>
        <button
          className={`tab ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          All Students ({parents.reduce((total, parent) => total + parent.children.length, 0)})
        </button>
      </div>

      {/* Parents Tab */}
      {activeTab === 'parents' && (
        <div className="parents-grid">
          {parents.length === 0 ? (
            <div className="no-parents">
              <p>No parents found. You'll see parents here once they book sessions with you.</p>
            </div>
          ) : (
            parents.map(parent => (
              <div key={parent.id} className="parent-card">
                <div className="parent-header">
                  <div className="parent-info">
                    <div className="avatar">
                      {parent.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3>{parent.name}</h3>
                      <p>{parent.location || 'No location specified'}</p>
                    </div>
                  </div>
                  <div className="parent-stats">
                    <span className="sessions-count">{parent.totalSessions} sessions</span>
                    {parent.rating && (
                      <span
                        className="rating-badge"
                        style={{ backgroundColor: getRatingColor(parent.rating) }}
                      >
                        ⭐ {parent.rating}
                      </span>
                    )}
                  </div>
                </div>

                <div className="contact-info">
                  <div className="contact-item">
                    <span>📧</span>
                    <span>{parent.email}</span>
                  </div>
                  <div className="contact-item">
                    <span>📞</span>
                    <span>{parent.contact || 'No contact provided'}</span>
                  </div>
                  <div className="contact-item">
                    <span>📅</span>
                    <span>Joined {new Date(parent.joinDate).toLocaleDateString()}</span>
                  </div>
                  {parent.subject_name && (
                    <div className="contact-item">
                      <span>📚</span>
                      <span>{parent.subject_name}</span>
                    </div>
                  )}
                </div>

                <div className="children-section">
                  <h4>Children:</h4>
                  <div className="children-list">
                    {parent.children.map(child => (
                      <div key={child.id} className="child-tag">
                        {child.name} ({child.grade})
                      </div>
                    ))}
                  </div>
                </div>

                {parent.review && (
                  <div className="review-section">
                    <h4>Your Review:</h4>
                    <div className="review-content">
                      {renderStars(parent.rating)}
                      <p>{parent.review}</p>
                    </div>
                  </div>
                )}

                <div className="card-actions">
                  <button
                    className="rate-btn"
                    onClick={() => handleRateParent(parent)}
                  >
                    {parent.rating ? 'Update Rating' : 'Rate Parent'}
                  </button>
                  <button className="message-btn">
                    Send Message
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="students-table">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Grade</th>
                  <th>Age</th>
                  <th>Parent</th>
                  <th>Sessions</th>
                  <th>Last Session</th>
                </tr>
              </thead>
              <tbody>
                {parents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-data">
                      No students found
                    </td>
                  </tr>
                ) : (
                  parents.flatMap(parent =>
                    parent.children.map(child => (
                      <tr key={child.id}>
                        <td className="student-name">
                          <div className="name-avatar">
                            <div className="avatar-sm">
                              {child.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            {child.name}
                          </div>
                        </td>
                        <td>{child.grade}</td>
                        <td>{child.age} years</td>
                        <td className="parent-name">{parent.name}</td>
                        <td>{child.sessions}</td>
                        <td>{parent.lastSession ? new Date(parent.lastSession).toLocaleDateString() : 'No sessions yet'}</td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

              <div className="review-section-modal">
                <label htmlFor="review">Your Review</label>
                <textarea
                  id="review"
                  value={ratingForm.review}
                  onChange={(e) => setRatingForm(prev => ({ ...prev, review: e.target.value }))}
                  placeholder="Share your experience working with this parent. Be specific about communication, punctuality, cooperation, etc."
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
                  <span>I would recommend this parent to other tutors</span>
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
                  Submit Rating
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