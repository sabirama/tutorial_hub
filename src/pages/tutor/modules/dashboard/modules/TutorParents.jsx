import { useState } from 'react';
import "../../../../../assets/css/TutorParents.css"
const TutorParents = () => {
  const [activeTab, setActiveTab] = useState('parents');
  const [ratingModal, setRatingModal] = useState({ isOpen: false, parent: null });

  const [parents, setParents] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      contact: '(555) 123-4567',
      location: 'New York, NY',
      joinDate: '2023-01-15',
      totalSessions: 24,
      children: [
        { id: 1, name: 'Emma Johnson', grade: '8th Grade', age: 13, sessions: 12 },
        { id: 2, name: 'Noah Johnson', grade: '6th Grade', age: 11, sessions: 12 }
      ],
      rating: 4.8,
      review: 'Very cooperative and punctual. Always provides clear learning objectives.',
      lastSession: '2024-01-15'
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.c@email.com',
      contact: '(555) 234-5678',
      location: 'San Francisco, CA',
      joinDate: '2023-02-20',
      totalSessions: 18,
      children: [
        { id: 3, name: 'Alex Chen', grade: '10th Grade', age: 16, sessions: 18 }
      ],
      rating: 4.5,
      review: 'Good communication and flexible with scheduling.',
      lastSession: '2024-01-14'
    },
    {
      id: 3,
      name: 'Emily Davis',
      email: 'emily.d@email.com',
      location: 'Chicago, IL',
      contact: '(555) 345-6789',
      joinDate: '2023-03-10',
      totalSessions: 32,
      children: [
        { id: 4, name: 'Sophia Davis', grade: '9th Grade', age: 14, sessions: 15 },
        { id: 5, name: 'Liam Davis', grade: '7th Grade', age: 12, sessions: 10 },
        { id: 6, name: 'Olivia Davis', grade: '5th Grade', age: 10, sessions: 7 }
      ],
      rating: null,
      review: null,
      lastSession: '2024-01-13'
    }
  ]);

  const [ratingForm, setRatingForm] = useState({
    rating: 0,
    review: '',
    wouldRecommend: true
  });

  const handleRateParent = (parent) => {
    setRatingModal({ isOpen: true, parent });
    setRatingForm({
      rating: parent.rating || 0,
      review: parent.review || '',
      wouldRecommend: true
    });
  };

  const handleSubmitRating = (e) => {
    e.preventDefault();
    
    setParents(prev => prev.map(parent => 
      parent.id === ratingModal.parent.id 
        ? { ...parent, rating: ratingForm.rating, review: ratingForm.review }
        : parent
    ));

    setRatingModal({ isOpen: false, parent: null });
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

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#10b759';
    if (rating >= 4.0) return '#f59e0b';
    if (rating >= 3.0) return '#f97316';
    return '#ef4444';
  };

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
          {parents.map(parent => (
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
                  <span>{parent.contact}</span>
                </div>
                <div className="contact-item">
                  <span>📅</span>
                  <span>Joined {new Date(parent.joinDate).toLocaleDateString()}</span>
                </div>
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
          ))}
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
                {parents.flatMap(parent => 
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
                      <td>{new Date(parent.lastSession).toLocaleDateString()}</td>

                    </tr>
                  ))
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