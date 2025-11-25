import { useState, useEffect } from 'react';
import "../../../../../assets/css/TutorsProfle.css"
import apiCall from '../../../../../middlewares/api/axios';
import { getUserId, getToken } from '../../../../../middlewares/auth/auth';

const TutorProfile = () => {
  const [tutor, setTutor] = useState({
    id: 1,
    full_name: "",
    contact_number: "",
    email: "",
    course: "",
    location: "",
    facebook: "",
    username: "",
    profile_image: "",
    bio: "",
    hourly_rate: "",
    experience: "",
    education: "",
    subjects_offered: [],
    rating: 0,
    total_sessions: 0,
    availability: [],
    languages: [],
    join_date: ""
  });
  
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...tutor });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchTutorProfile();
  }, []);

  const fetchTutorProfile = async () => {
    try {
      const tutorId = getUserId();
      const response = await apiCall({
        method: 'get',
        url: `/tutors/${tutorId}`,
      });
      
      if (response.data.data) {
        const tutorData = response.data.data;
        setTutor({
          id: tutorData.id || tutorId,
          full_name: tutorData.full_name || "",
          contact_number: tutorData.contact_number || "",
          email: tutorData.email || "",
          course: tutorData.course || "",
          location: tutorData.location || "",
          facebook: tutorData.facebook || "",
          username: tutorData.username || "",
          profile_image: tutorData.profile_image || "",
          bio: tutorData.bio || "",
          hourly_rate: tutorData.hourly_rate || "0Php",
          experience: tutorData.experience || "0 years",
          education: tutorData.education || "",
          subjects_offered: tutorData.subjects_offered || [],
          rating: tutorData.rating || 0,
          total_sessions: tutorData.stats?.total_sessions || 0,
          availability: tutorData.availability || [],
          languages: tutorData.languages || ["English"],
          join_date: tutorData.created_at || new Date().toISOString()
        });
        setEditForm({
          id: tutorData.id || tutorId,
          full_name: tutorData.full_name || "",
          contact_number: tutorData.contact_number || "",
          email: tutorData.email || "",
          course: tutorData.course || "",
          location: tutorData.location || "",
          facebook: tutorData.facebook || "",
          username: tutorData.username || "",
          profile_image: tutorData.profile_image || "",
          bio: tutorData.bio || "",
          hourly_rate: tutorData.hourly_rate || "$0",
          experience: tutorData.experience || "0 years",
          education: tutorData.education || "",
          subjects_offered: tutorData.subjects_offered || [],
          rating: tutorData.rating || 0,
          total_sessions: tutorData.stats?.total_sessions || 0,
          availability: tutorData.availability || [],
          languages: tutorData.languages || ["English"],
          join_date: tutorData.created_at || new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error fetching tutor profile:', error);
      alert('Failed to load tutor profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Create object URL for immediate preview (client-side only)
      const objectUrl = URL.createObjectURL(file);
      
      // Update both tutor and editForm states with the object URL
      setTutor(prev => ({ 
        ...prev, 
        profile_image: objectUrl 
      }));
      setEditForm(prev => ({ 
        ...prev, 
        profile_image: objectUrl 
      }));
      
      console.log('Image preview updated with object URL');
      
      // Show success message
      alert('Profile image updated successfully! This is a preview. The image will be saved when you save your profile.');
      
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image. Please try again.');
    } finally {
      setUploading(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    if (!window.confirm('Are you sure you want to remove your profile image?')) {
      return;
    }

    // Revoke object URL to prevent memory leaks
    if (tutor.profile_image && tutor.profile_image.startsWith('blob:')) {
      URL.revokeObjectURL(tutor.profile_image);
    }

    // Update both tutor and editForm states
    setTutor(prev => ({ ...prev, profile_image: '' }));
    setEditForm(prev => ({ ...prev, profile_image: '' }));
    
    alert('Profile image removed successfully!');
  };

  const handleSave = async () => {
    try {
      const tutorId = getUserId();
      const updateData = {
        full_name: editForm.full_name,
        contact_number: editForm.contact_number,
        email: editForm.email,
        course: editForm.course,
        location: editForm.location,
        facebook: editForm.facebook,
        bio: editForm.bio,
        hourly_rate: editForm.hourly_rate,
        experience: editForm.experience,
        education: editForm.education
      };

      // If there's a new image (object URL), we need to handle it differently
      // For now, we'll just save the text data and note that image needs separate handling
      if (editForm.profile_image && editForm.profile_image.startsWith('blob:')) {
        alert('Note: Profile image changes are currently preview only. Image upload functionality will be added soon.');
      }

      const response = await apiCall({
        method: 'put',
        url: `/tutors/${tutorId}`,
        data: updateData,
        headers: {
          'token': getToken()
        }
      });

      if (response.data.success) {
        setTutor(editForm);
        setIsEditing(false);
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating tutor profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleCancel = () => {
    // Revoke any object URLs that were created during editing
    if (editForm.profile_image && editForm.profile_image.startsWith('blob:') && 
        editForm.profile_image !== tutor.profile_image) {
      URL.revokeObjectURL(editForm.profile_image);
    }
    
    setEditForm(tutor);
    setIsEditing(false);
  };

  const stats = [
    { label: "Rating", value: tutor.rating, icon: "⭐" },
    { label: "Sessions", value: tutor.total_sessions, icon: "📚" },
    { label: "Experience", value: tutor.experience, icon: "🎓" },
    { label: "Hourly Rate", value: tutor.hourly_rate, icon: "💰" }
  ];

  if (loading) {
    return (
      <div className="tutor-profile">
        <div className="profile-header">
          <h1>Tutor Profile</h1>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

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
            <div className="profile-image-container">
              <div className="profile-image">
                {tutor.profile_image ? (
                  <div className="image-wrapper">
                    <img 
                      src={tutor.profile_image} 
                      alt={tutor.full_name}
                      key={tutor.profile_image} // Force re-render on URL change
                      onLoad={() => console.log('Image loaded successfully')}
                      onError={(e) => {
                        console.error('Image failed to load:', tutor.profile_image);
                        // Fallback to avatar
                        e.target.style.display = 'none';
                      }}
                    />
                    {uploading && <div className="upload-overlay">Uploading...</div>}
                  </div>
                ) : (
                  <div className="avatar-large">
                    {tutor.full_name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
              </div>
              
              {/* Image Upload Controls */}
              <div className="image-upload-controls">
                <label className="upload-btn">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                  {uploading ? 'Uploading...' : 'Change Photo'}
                </label>
                
                {tutor.profile_image && (
                  <button 
                    className="remove-btn"
                    onClick={handleRemoveImage}
                    disabled={uploading}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            
            <div className="profile-info">
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => handleEditChange('full_name', e.target.value)}
                    className="edit-input"
                    placeholder="Full Name"
                  />
                  <input
                    type="text"
                    value={editForm.course}
                    onChange={(e) => handleEditChange('course', e.target.value)}
                    className="edit-input"
                    placeholder="Course/Qualification"
                  />
                </>
              ) : (
                <>
                  <h2>{tutor.full_name || "No Name Provided"}</h2>
                  <p className="course">{tutor.course || "No course specified"}</p>
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
                    placeholder="Email"
                  />
                </div>
                <div className="contact-item">
                  <span>📞</span>
                  <input
                    type="text"
                    value={editForm.contact_number}
                    onChange={(e) => handleEditChange('contact_number', e.target.value)}
                    className="edit-input"
                    placeholder="Contact Number"
                  />
                </div>
                <div className="contact-item">
                  <span>📍</span>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => handleEditChange('location', e.target.value)}
                    className="edit-input"
                    placeholder="Location"
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
                  <span>{tutor.email || "No email provided"}</span>
                </div>
                <div className="contact-item">
                  <span>📞</span>
                  <span>{tutor.contact_number || "No contact number"}</span>
                </div>
                <div className="contact-item">
                  <span>📍</span>
                  <span>{tutor.location || "No location specified"}</span>
                </div>
                {tutor.facebook && (
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
                )}
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
                placeholder="Tell us about yourself, your teaching style, and experience..."
              />
            ) : (
              <p>{tutor.bio || "No bio provided yet."}</p>
            )}
          </div>

          {/* Subjects */}
          <div className="subjects-card">
            <h3>Subjects Offered</h3>
            <div className="subjects-list">
              {tutor.subjects_offered && tutor.subjects_offered.length > 0 ? (
                tutor.subjects_offered.map((subject, index) => (
                  <span key={index} className="subject-tag">
                    {subject}
                  </span>
                ))
              ) : (
                <p className="no-data">No subjects specified yet.</p>
              )}
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
                  placeholder="Educational background"
                />
              ) : (
                <p>{tutor.education || "No education information provided"}</p>
              )}
            </div>

            <div className="info-card">
              <h4>Experience</h4>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.experience}
                  onChange={(e) => handleEditChange('experience', e.target.value)}
                  className="edit-input"
                  placeholder="Teaching experience"
                />
              ) : (
                <p>{tutor.experience || "No experience specified"}</p>
              )}
            </div>

            <div className="info-card">
              <h4>Hourly Rate</h4>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.hourly_rate}
                  onChange={(e) => handleEditChange('hourly_rate', e.target.value)}
                  className="edit-input"
                  placeholder="Hourly rate"
                />
              ) : (
                <p>{tutor.hourly_rate || "Rate not specified"}</p>
              )}
            </div>

            <div className="info-card">
              <h4>Availability</h4>
              <div className="availability-list">
                {tutor.availability && tutor.availability.length > 0 ? (
                  tutor.availability.map((day, index) => (
                    <span key={index} className="availability-tag">
                      {day}
                    </span>
                  ))
                ) : (
                  <p className="no-data">No availability set</p>
                )}
              </div>
            </div>

            <div className="info-card">
              <h4>Languages</h4>
              <div className="languages-list">
                {tutor.languages && tutor.languages.length > 0 ? (
                  tutor.languages.map((language, index) => (
                    <span key={index} className="language-tag">
                      {language}
                    </span>
                  ))
                ) : (
                  <p className="no-data">No languages specified</p>
                )}
              </div>
            </div>

            <div className="info-card">
              <h4>Member Since</h4>
              <p>{tutor.join_date ? new Date(tutor.join_date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) : "Recently"}</p>
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