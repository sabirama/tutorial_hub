import { useState } from 'react';
import "../../../../../assets/css/TutorsProfle.css"

const TutorProfile = () => {
  const [tutor, setTutor] = useState({
    id: 1,
    full_name: "John Smith",
    contact_number: "(555) 123-4567",
    email: "john.smith@email.com",
    course: "Bachelor of Science in Mathematics",
    location: "New York, NY",
    facebook: "john.smith",
    username: "john_math",
    profile_image: "",
    bio: "Experienced mathematics tutor with 5+ years of teaching algebra, calculus, and geometry. Passionate about making math accessible and enjoyable for all students.",
    hourly_rate: "$35",
    experience: "5 years",
    education: "BS Mathematics, University of California",
    subjects_offered: ["Mathematics", "Algebra", "Calculus", "Geometry", "Statistics"],
    rating: 4.8,
    total_sessions: 127,
    availability: ["Monday", "Wednesday", "Friday"],
    languages: ["English", "Spanish"],
    join_date: "2023-01-15"
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...tutor });

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setTutor(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm(tutor);
    setIsEditing(false);
  };

  const stats = [
    { label: "Rating", value: tutor.rating, icon: "⭐" },
    { label: "Sessions", value: tutor.total_sessions, icon: "📚" },
    { label: "Experience", value: tutor.experience, icon: "🎓" },
    { label: "Hourly Rate", value: tutor.hourly_rate, icon: "💰" }
  ];

  return (
    <div className="tutor-profile">
      <div className="profile-header">
        <h1>Tutor Profile</h1>
        <button 
          className="edit-profile-btn"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Cancel Editing" : "Edit Profile"}
        </button>
      </div>

      <div className="profile-container">
        {/* Left Side - Profile Info */}
        <div className="profile-sidebar">
          <div className="profile-card">
            <div className="profile-image">
              {tutor.profile_image ? (
                <img src={tutor.profile_image} alt={tutor.full_name} />
              ) : (
                <div className="avatar-large">
                  {tutor.full_name.split(' ').map(n => n[0]).join('')}
                </div>
              )}
            </div>
            
            <div className="profile-info">
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => handleEditChange('full_name', e.target.value)}
                    className="edit-input"
                  />
                  <input
                    type="text"
                    value={editForm.course}
                    onChange={(e) => handleEditChange('course', e.target.value)}
                    className="edit-input"
                  />
                </>
              ) : (
                <>
                  <h2>{tutor.full_name}</h2>
                  <p className="course">{tutor.course}</p>
                </>
              )}
              
              <div className="rating">
                <span className="stars">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.floor(tutor.rating) ? 'star filled' : 'star'}>
                      {i < tutor.rating ? '★' : '☆'}
                    </span>
                  ))}
                </span>
                <span className="rating-value">({tutor.rating})</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <span className="stat-icon">{stat.icon}</span>
                <div className="stat-info">
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Info */}
          <div className="contact-card">
            <h3>Contact Information</h3>
            {isEditing ? (
              <>
                <div className="contact-item">
                  <span>📧</span>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => handleEditChange('email', e.target.value)}
                    className="edit-input"
                  />
                </div>
                <div className="contact-item">
                  <span>📞</span>
                  <input
                    type="text"
                    value={editForm.contact_number}
                    onChange={(e) => handleEditChange('contact_number', e.target.value)}
                    className="edit-input"
                  />
                </div>
                <div className="contact-item">
                  <span>📍</span>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => handleEditChange('location', e.target.value)}
                    className="edit-input"
                  />
                </div>
                <div className="contact-item">
                  <span>🔗</span>
                  <input
                    type="text"
                    value={editForm.facebook}
                    onChange={(e) => handleEditChange('facebook', e.target.value)}
                    className="edit-input"
                    placeholder="Facebook username"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="contact-item">
                  <span>📧</span>
                  <span>{tutor.email}</span>
                </div>
                <div className="contact-item">
                  <span>📞</span>
                  <span>{tutor.contact_number}</span>
                </div>
                <div className="contact-item">
                  <span>📍</span>
                  <span>{tutor.location}</span>
                </div>
                <div className="contact-item">
                  <span>🔗</span>
                  <a 
                    href={`https://facebook.com/${tutor.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    @{tutor.facebook}
                  </a>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Side - Detailed Info */}
        <div className="profile-content">
          {/* Bio */}
          <div className="bio-card">
            <h3>About Me</h3>
            {isEditing ? (
              <textarea
                value={editForm.bio}
                onChange={(e) => handleEditChange('bio', e.target.value)}
                className="edit-textarea"
                rows="4"
              />
            ) : (
              <p>{tutor.bio}</p>
            )}
          </div>

          {/* Subjects */}
          <div className="subjects-card">
            <h3>Subjects Offered</h3>
            <div className="subjects-list">
              {tutor.subjects_offered.map((subject, index) => (
                <span key={index} className="subject-tag">
                  {subject}
                </span>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div className="info-grid">
            <div className="info-card">
              <h4>Education</h4>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.education}
                  onChange={(e) => handleEditChange('education', e.target.value)}
                  className="edit-input"
                />
              ) : (
                <p>{tutor.education}</p>
              )}
            </div>

            <div className="info-card">
              <h4>Availability</h4>
              <div className="availability-list">
                {tutor.availability.map((day, index) => (
                  <span key={index} className="availability-tag">
                    {day}
                  </span>
                ))}
              </div>
            </div>

            <div className="info-card">
              <h4>Languages</h4>
              <div className="languages-list">
                {tutor.languages.map((language, index) => (
                  <span key={index} className="language-tag">
                    {language}
                  </span>
                ))}
              </div>
            </div>

            <div className="info-card">
              <h4>Member Since</h4>
              <p>{new Date(tutor.join_date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
          </div>

          {/* Edit Actions */}
          {isEditing && (
            <div className="edit-actions">
              <button className="save-btn" onClick={handleSave}>
                Save Changes
              </button>
              <button className="cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorProfile;