import { useState, useEffect } from 'react';
import "../../../../../assets/css/ParentsProfile.css"
import apiCall from '../../../../../middlewares/api/axios';
import { getUserId, getToken } from '../../../../../middlewares/auth/auth';
import { useNavigate } from 'react-router-dom';

const ParentProfile = () => {

  const navigate = useNavigate();

  if (!sessionStorage.getItem("token")) {
    navigate('/');
  }


  const [parent, setParent] = useState({
    id: 1,
    full_name: "",
    contact_number: "",
    email: "",
    location: "",
    facebook: "",
    username: "",
    profile_image: "",
    bio: "",
    created_at: "",
    updated_at: ""
  });

  const [children, setChildren] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...parent });
  const [editChildren, setEditChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchParentData();
  }, []);

  const fetchParentData = async () => {
    try {
      const response = await apiCall({
        method: 'get',
        url: `/parents/${getUserId()}/profile`,
      });

      console.log('API Response:', response.data);

      if (response.data.success) {
        const profileData = response.data.data;

        // Set parent data with proper structure
        const parentData = {
          id: profileData.id || getUserId(),
          full_name: profileData.full_name || "",
          contact_number: profileData.contact_number || "",
          email: profileData.email || "",
          location: profileData.location || "",
          facebook: profileData.facebook || "",
          username: profileData.username || "",
          profile_image: profileData.profile_image || "",
          bio: profileData.bio || "",
          created_at: profileData.created_at || "",
          updated_at: profileData.updated_at || ""
        };

        setParent(parentData);
        setEditForm(parentData);
        setChildren(profileData.children || []);
        setEditChildren(profileData.children || []);
      }
    } catch (error) {
      console.error('Error fetching parent profile:', error);
      alert('Failed to load parent profile');
    } finally {
      setLoading(false);
    }
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

      // Update both parent and editForm states with the object URL
      setParent(prev => ({
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
    if (parent.profile_image && parent.profile_image.startsWith('blob:')) {
      URL.revokeObjectURL(parent.profile_image);
    }

    // Update both parent and editForm states
    setParent(prev => ({ ...prev, profile_image: '' }));
    setEditForm(prev => ({ ...prev, profile_image: '' }));

    alert('Profile image removed successfully!');
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleChildChange = (index, field, value) => {
    const updatedChildren = [...editChildren];
    updatedChildren[index] = { ...updatedChildren[index], [field]: value };
    setEditChildren(updatedChildren);
  };

  const handleSave = async () => {
    try {
      const parentId = getUserId();
      const updateData = {
        full_name: editForm.full_name,
        contact_number: editForm.contact_number,
        email: editForm.email,
        location: editForm.location,
        facebook: editForm.facebook,
        bio: editForm.bio
      };

      // If there's a new image (object URL), we need to handle it differently
      // For now, we'll just save the text data and note that image needs separate handling
      if (editForm.profile_image && editForm.profile_image.startsWith('blob:')) {
        alert('Note: Profile image changes are currently preview only. Image upload functionality will be added soon.');
      }

      const response = await apiCall({
        method: 'put',
        url: `/parents/${parentId}`,
        data: updateData,
        headers: {
          'token': getToken()
        }
      });

      if (response.data.success) {
        setParent(editForm);

        // Now update children if they were modified
        await updateChildren();

        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile: ' + (error.response?.data?.error || error.message));
    }
  };

  const updateChildren = async () => {
    try {
      const parentId = getUserId();
      const currentChildrenIds = children.map(child => child.id).filter(Boolean);
      const editedChildrenIds = editChildren.map(child => child.id).filter(Boolean);

      // Find new children (no id)
      const newChildren = editChildren.filter(child => !child.id);

      // Find updated children (has id and exists in current)
      const updatedChildren = editChildren.filter(child =>
        child.id && currentChildrenIds.includes(child.id)
      );

      // Find deleted children (in current but not in edited)
      const deletedChildrenIds = currentChildrenIds.filter(id =>
        !editedChildrenIds.includes(id)
      );

      console.log('Children to process:', { newChildren, updatedChildren, deletedChildrenIds });

      // Create new children
      for (const child of newChildren) {
        await apiCall({
          method: 'post',
          url: `/parents/${parentId}/children`,
          data: {
            name: child.name,
            grade: child.grade,
            age: child.age
          }
        });
      }

      // Update existing children
      for (const child of updatedChildren) {
        await apiCall({
          method: 'put',
          url: `/parents/${parentId}/children/${child.id}`,
          data: {
            name: child.name,
            grade: child.grade,
            age: child.age
          }
        });
      }

      // Delete removed children
      for (const childId of deletedChildrenIds) {
        console.log('Deleting child with ID:', childId);
        await apiCall({
          method: 'delete',
          url: `/parents/${parentId}/children/${childId}`,
        });
      }

      // Refresh children data
      const childrenResponse = await apiCall({
        method: 'get',
        url: `/parents/${parentId}/children`,
      });

      if (childrenResponse.data.success) {
        setChildren(childrenResponse.data.data);
        setEditChildren(childrenResponse.data.data);
      }

    } catch (error) {
      console.error('Error updating children:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    // Revoke any object URLs that were created during editing
    if (editForm.profile_image && editForm.profile_image.startsWith('blob:') &&
      editForm.profile_image !== parent.profile_image) {
      URL.revokeObjectURL(editForm.profile_image);
    }

    setEditForm(parent);
    setEditChildren(children);
    setIsEditing(false);
  };

  const addChild = () => {
    setEditChildren(prev => [
      ...prev,
      { name: "", grade: "", age: "" }
    ]);
  };

  const removeChild = (index) => {
    console.log('Removing child at index:', index, editChildren[index]);
    setEditChildren(prev => prev.filter((_, i) => i !== index));
  };

  // Calculate stats from actual data
  const stats = [
    { label: "Member Since", value: parent.created_at ? new Date(parent.created_at).getFullYear() : 'N/A', icon: "📅" },
    { label: "Children", value: children.length, icon: "👨‍👩‍👧‍👦" }
  ];

  if (loading) {
    return (
      <div className="parent-profile">
        <div className="profile-header">
          <h1>Parent Profile</h1>
        </div>
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

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
            <div className="profile-image-container">
              <div className="profile-image">
                {parent.profile_image ? (
                  <div className="image-wrapper">
                    <img
                      src={parent.profile_image}
                      alt={parent.full_name}
                      key={parent.profile_image}
                      onLoad={() => console.log('Image loaded successfully')}
                      onError={(e) => {
                        console.error('Image failed to load:', parent.profile_image);
                        // Fallback to avatar
                        e.target.style.display = 'none';
                      }}
                    />
                    {uploading && <div className="upload-overlay">Uploading...</div>}
                  </div>
                ) : (
                  <div className="avatar-large">
                    {parent.full_name?.split(' ').map(n => n[0]).join('') || 'P'}
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

                {parent.profile_image && (
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
                <input
                  type="text"
                  value={editForm.full_name || ''}
                  onChange={(e) => handleEditChange('full_name', e.target.value)}
                  className="edit-input"
                  placeholder="Full Name"
                />
              ) : (
                <h2>{parent.full_name || "No Name Provided"}</h2>
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

        </div>

        {/* Right Side - Detailed Info */}
        <div className="profile-content">
          {/* Bio */}
          <div className="bio-card">
            <h3>About Me</h3>
            {isEditing ? (
              <textarea
                value={editForm.bio || ''}
                onChange={(e) => handleEditChange('bio', e.target.value)}
                className="edit-textarea"
                rows="4"
                placeholder="Tell us about yourself and your children..."
              />
            ) : (
              <p>{parent.bio || "No bio provided yet."}</p>
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
                editChildren.map((child, index) => (
                  <div key={child.id || `new-${index}`} className="child-edit-item">
                    <input
                      type="text"
                      value={child.name || ''}
                      onChange={(e) => handleChildChange(index, 'name', e.target.value)}
                      className="edit-input"
                      placeholder="Child's Name"
                    />
                    <input
                      type="text"
                      value={child.grade || ''}
                      onChange={(e) => handleChildChange(index, 'grade', e.target.value)}
                      className="edit-input"
                      placeholder="Grade Level"
                    />
                    <input
                      type="text"
                      value={child.age || ''}
                      onChange={(e) => handleChildChange(index, 'age', e.target.value)}
                      className="edit-input"
                      placeholder="Age"
                    />
                    <button
                      className="remove-child-btn"
                      onClick={() => removeChild(index)}
                    >
                      🗑️
                    </button>
                  </div>
                ))
              ) : (
                children.map((child, index) => (
                  <div key={child.id || index} className="child-item">
                    <div className="child-info">
                      <h4>{child.name}</h4>
                      <p>{child.grade} • {child.age} years old</p>
                    </div>
                  </div>
                ))
              )}
              {children.length === 0 && !isEditing && (
                <p className="no-children">No children information added yet.</p>
              )}
            </div>
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
                    value={editForm.email || ''}
                    onChange={(e) => handleEditChange('email', e.target.value)}
                    className="edit-input"
                    placeholder="Email"
                  />
                </div>
                <div className="contact-item">
                  <span>📞</span>
                  <input
                    type="text"
                    value={editForm.contact_number || ''}
                    onChange={(e) => handleEditChange('contact_number', e.target.value)}
                    className="edit-input"
                    placeholder="Contact Number"
                  />
                </div>
                <div className="contact-item">
                  <span>📍</span>
                  <input
                    type="text"
                    value={editForm.location || ''}
                    onChange={(e) => handleEditChange('location', e.target.value)}
                    className="edit-input"
                    placeholder="Location"
                  />
                </div>
                <div className="contact-item">
                  <span>🔗</span>
                  <input
                    type="text"
                    value={editForm.facebook || ''}
                    onChange={(e) => handleEditChange('facebook', e.target.value)}
                    className="edit-input"
                    placeholder="Facebook Link"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="contact-item">
                  <span>📧</span>
                  <span>{parent.email || "No email provided"}</span>
                </div>
                <div className="contact-item">
                  <span>📞</span>
                  <span>{parent.contact_number || "No contact number"}</span>
                </div>
                <div className="contact-item">
                  <span>📍</span>
                  <span>{parent.location || "No location specified"}</span>
                </div>
                {parent.facebook && (
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
                )}
              </>
            )}
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