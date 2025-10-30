import { useState } from 'react';
import "../../../../../assets/css/ParentsProfile.css"

const ParentProfile = () => {
  const [parent, setParent] = useState({
    id: 1,
    full_name: "Sarah Johnson",
    contact_number: "(555) 123-4567",
    email: "sarah.j@email.com",
    location: "New York, NY",
    facebook: "sarah.johnson",
    username: "sarah_parent",
    profile_image: "",
    bio: "Parent of two wonderful children - Emma (Grade 8) and Noah (Grade 6). Passionate about providing quality education and supporting their academic growth.",
    children: [
      { name: "Emma Johnson", grade: "8th Grade", age: 13 },
      { name: "Noah Johnson", grade: "6th Grade", age: 11 }
    ],
    preferred_subjects: ["Mathematics", "Science", "English"],
    preferred_schedule: ["Weekdays after 3 PM", "Saturday mornings"],
    join_date: "2023-01-15",
    total_sessions: 45,
    active_tutors: 3
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...parent });

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleChildChange = (index, field, value) => {
    const updatedChildren = [...editForm.children];
    updatedChildren[index] = { ...updatedChildren[index], [field]: value };
    setEditForm(prev => ({ ...prev, children: updatedChildren }));
  };

  const handleSave = () => {
    setParent(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm(parent);
    setIsEditing(false);
  };

  const addChild = () => {
    setEditForm(prev => ({
      ...prev,
      children: [...prev.children, { name: "", grade: "", age: "" }]
    }));
  };

  const removeChild = (index) => {
    setEditForm(prev => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index)
    }));
  };

  const stats = [
    { label: "Total Sessions", value: parent.total_sessions, icon: "📚" },
    { label: "Active Tutors", value: parent.active_tutors, icon: "👨‍🏫" },
    { label: "Children", value: parent.children.length, icon: "👨‍👩‍👧‍👦" },
    { label: "Member Since", value: new Date(parent.join_date).getFullYear(), icon: "📅" }
  ];

  return (
    <div className="parent-profile">
      <div className="profile-header">
        <h1>Parent Profile</h1>
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
              {parent.profile_image ? (
                <img src={parent.profile_image} alt={parent.full_name} />
              ) : (
                <div className="avatar-large">
                  {parent.full_name.split(' ').map(n => n[0]).join('')}
                </div>
              )}
            </div>
            
            <div className="profile-info">
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => handleEditChange('full_name', e.target.value)}
                  className="edit-input"
                />
              ) : (
                <h2>{parent.full_name}</h2>
              )}
              <p className="role">Parent</p>
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
                  <span>{parent.email}</span>
                </div>
                <div className="contact-item">
                  <span>📞</span>
                  <span>{parent.contact_number}</span>
                </div>
                <div className="contact-item">
                  <span>📍</span>
                  <span>{parent.location}</span>
                </div>
                <div className="contact-item">
                  <span>🔗</span>
                  <a 
                    href={`https://facebook.com/${parent.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    @{parent.facebook}
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
                placeholder="Tell us about yourself and your children..."
              />
            ) : (
              <p>{parent.bio}</p>
            )}
          </div>

          {/* Children Information */}
          <div className="children-card">
            <div className="card-header">
              <h3>Children Information</h3>
              {isEditing && (
                <button className="add-child-btn" onClick={addChild}>
                  + Add Child
                </button>
              )}
            </div>
            <div className="children-list">
              {isEditing ? (
                editForm.children.map((child, index) => (
                  <div key={index} className="child-edit-item">
                    <input
                      type="text"
                      value={child.name}
                      onChange={(e) => handleChildChange(index, 'name', e.target.value)}
                      className="edit-input"
                      placeholder="Child's Name"
                    />
                    <input
                      type="text"
                      value={child.grade}
                      onChange={(e) => handleChildChange(index, 'grade', e.target.value)}
                      className="edit-input"
                      placeholder="Grade Level"
                    />
                    <input
                      type="text"
                      value={child.age}
                      onChange={(e) => handleChildChange(index, 'age', e.target.value)}
                      className="edit-input"
                      placeholder="Age"
                    />
                    {editForm.children.length > 1 && (
                      <button 
                        className="remove-child-btn"
                        onClick={() => removeChild(index)}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))
              ) : (
                parent.children.map((child, index) => (
                  <div key={index} className="child-item">
                    <div className="child-info">
                      <h4>{child.name}</h4>
                      <p>{child.grade} • {child.age} years old</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Preferences */}
          <div className="preferences-grid">
            <div className="preference-card">
              <h4>Preferred Subjects</h4>
              <div className="preferences-list">
                {parent.preferred_subjects.map((subject, index) => (
                  <span key={index} className="preference-tag">
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            <div className="preference-card">
              <h4>Preferred Schedule</h4>
              <div className="preferences-list">
                {parent.preferred_schedule.map((schedule, index) => (
                  <span key={index} className="schedule-tag">
                    {schedule}
                  </span>
                ))}
              </div>
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

export default ParentProfile;