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
  const [newImageFile, setNewImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // Separate preview URL

  useEffect(() => {
    fetchParentData();
  }, []);

  const fetchParentData = async () => {
    try {
      const response = await apiCall({
        method: 'get',
        url: `/parents/${getUserId()}/profile`,
        headers: {
          token: getToken()
        }
      });

      console.log('API Response:', response.data);

      if (response.data.success) {
        const profileData = response.data.data;

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

    // Store the file for later upload
    setNewImageFile(file);

    // Create object URL for immediate preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    console.log('Image selected for upload:', file.name);
  };

  const handleRemoveImage = () => {
    if (!window.confirm('Are you sure you want to remove your profile image?')) {
      return;
    }

    // Revoke preview URL if exists
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    // Clear the stored file
    setNewImageFile(null);

    // Update editForm to mark for deletion
    setEditForm(prev => ({ ...prev, profile_image: '' }));

    alert('Profile image will be removed when you save changes');
  };

  const deleteProfileImage = async () => {
    try {
      const response = await apiCall({
        method: 'delete',
        url: `/parents/${getUserId()}/profile-image`,
        headers: {
          'token': getToken()
        }
      });

      if (response.data.success) {
        console.log('Profile image deleted successfully');
        return true;
      } else {
        console.error('Failed to delete image:', response.data.error);
        return false;
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
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
      setUploading(true);

      console.log('Saving profile...');

      // 1. Handle image upload/removal
      let finalImageUrl = parent.profile_image; // Keep current by default

      if (newImageFile) {
        console.log('Uploading new image...');
        const imageUrl = await uploadProfileImage();
        if (!imageUrl) {
          setUploading(false);
          alert('Failed to upload profile image');
          return;
        }
        finalImageUrl = imageUrl;
      } else if (editForm.profile_image === '' && parent.profile_image) {
        console.log('Deleting existing image...');
        const success = await deleteProfileImage();
        if (!success) {
          setUploading(false);
          alert('Failed to delete profile image');
          return;
        }
        finalImageUrl = '';
      }

      // 2. Update parent text fields
      const updateData = {
        full_name: editForm.full_name,
        contact_number: editForm.contact_number,
        email: editForm.email,
        location: editForm.location,
        facebook: editForm.facebook,
        bio: editForm.bio
      };

      console.log('Updating parent text data:', updateData);

      const response = await apiCall({
        method: 'put',
        url: `/parents/${parentId}`,
        data: updateData,
        headers: {
          'token': getToken()
        }
      });

      if (response.data.success) {
        console.log('Profile text data updated successfully');

        // 3. Update children if changed
        if (JSON.stringify(children) !== JSON.stringify(editChildren)) {
          await updateChildren();
        }

        // 4. Update parent state with the final image URL
        const updatedParent = {
          ...editForm,
          profile_image: finalImageUrl
        };
        setParent(updatedParent);
        setEditForm(updatedParent);

        // 5. Clean up
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        setNewImageFile(null);

        setIsEditing(false);
        alert('Profile updated successfully!');

        // 6. Refresh to get latest data from server
        await fetchParentData();
      } else {
        alert('Failed to update profile: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const uploadProfileImage = async () => {
    if (!newImageFile) {
      return null;
    }

    try {
      const formData = new FormData();
      formData.append('profile_image', newImageFile);
      formData.append('parent_id', getUserId());

      console.log('Uploading image file:', newImageFile.name);

      const response = await apiCall({
        method: 'post',
        url: '/parents/upload-profile-image',
        data: formData,
        headers: {
          'token': getToken()
        }
      });

      console.log('Upload response:', response.data);

      if (response.data.success) {
        const imageUrl = response.data.data.imageUrl ||
          (response.data.data.parent && response.data.data.parent.profile_image);

        console.log('Image uploaded successfully. URL:', imageUrl);
        return imageUrl;
      } else {
        console.error('Failed to upload image:', response.data.error);
        throw new Error(response.data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const updateChildren = async () => {
    try {
      const parentId = getUserId();
      const currentChildrenIds = children.map(child => child.id).filter(Boolean);
      const editedChildrenIds = editChildren.map(child => child.id).filter(Boolean);

      const newChildren = editChildren.filter(child => !child.id);
      const updatedChildren = editChildren.filter(child =>
        child.id && currentChildrenIds.includes(child.id)
      );
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
          },
          headers: {
            'token': getToken()
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
          },
          headers: {
            'token': getToken()
          }
        });
      }

      // Delete removed children
      for (const childId of deletedChildrenIds) {
        console.log('Deleting child with ID:', childId);
        await apiCall({
          method: 'delete',
          url: `/parents/${parentId}/children/${childId}`,
          headers: {
            'token': getToken()
          }
        });
      }

      // Refresh children data
      const childrenResponse = await apiCall({
        method: 'get',
        url: `/parents/${parentId}/children`,
        headers: {
          'token': getToken()
        }
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
    // Revoke preview URL if it exists
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    setEditForm(parent);
    setEditChildren(children);
    setNewImageFile(null);
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

  const getInitials = (name) => {
    if (!name) return 'P';
    return name.split(' ').map(n => n && n[0]).join('').toUpperCase();
  };

  // Get the image URL to display
  const getDisplayImageUrl = () => {
    if (isEditing) {
      // In edit mode: show preview if available, otherwise show current image
      if (previewUrl) {
        return previewUrl;
      }
      if (editForm.profile_image && editForm.profile_image !== '') {
        return import.meta.env.VITE_BASE_URL.replace('/api', "") + editForm.profile_image;
      }
      return null;
    } else {
      // In view mode: show parent's current image
      if (parent.profile_image) {
        return import.meta.env.VITE_BASE_URL.replace('/api', "") + parent.profile_image;
      }
      return null;
    }
  };

  const displayImageUrl = getDisplayImageUrl();

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
          disabled={uploading}
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
                {displayImageUrl ? (
                  <div className="image-wrapper">
                    <img
                      src={displayImageUrl}
                      alt={editForm.full_name || parent.full_name || 'Profile'}
                      onLoad={() => console.log('Image loaded successfully')}
                      onError={(e) => {
                        console.error('Image failed to load');
                        e.target.style.display = 'none';
                        const nextSibling = e.target.nextElementSibling;
                        if (nextSibling) {
                          nextSibling.style.display = 'flex';
                        }
                      }}
                    />
                    <div className="avatar-fallback" style={{ display: 'none' }}>
                      {getInitials(isEditing ? editForm.full_name : parent.full_name)}
                    </div>
                    {uploading && <div className="upload-overlay">Uploading...</div>}
                  </div>
                ) : (
                  <div className="avatar-large">
                    {getInitials(isEditing ? editForm.full_name : parent.full_name)}
                  </div>
                )}
              </div>

              {/* Image Upload Controls - Only show in edit mode */}
              {isEditing && (
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

                  {(displayImageUrl || parent.profile_image) && (
                    <button
                      className="remove-btn"
                      onClick={handleRemoveImage}
                      disabled={uploading}
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="profile-info">
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.full_name || ''}
                  onChange={(e) => handleEditChange('full_name', e.target.value)}
                  className="edit-input"
                  placeholder="Full Name"
                  disabled={uploading}
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
                disabled={uploading}
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
                <button
                  className="add-child-btn"
                  onClick={addChild}
                  disabled={uploading}
                >
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
                      disabled={uploading}
                    />
                    <input
                      type="text"
                      value={child.grade || ''}
                      onChange={(e) => handleChildChange(index, 'grade', e.target.value)}
                      className="edit-input"
                      placeholder="Grade Level"
                      disabled={uploading}
                    />
                    <input
                      type="text"
                      value={child.age || ''}
                      onChange={(e) => handleChildChange(index, 'age', e.target.value)}
                      className="edit-input"
                      placeholder="Age"
                      disabled={uploading}
                    />
                    <button
                      className="remove-child-btn"
                      onClick={() => removeChild(index)}
                      disabled={uploading}
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
                    disabled={uploading}
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
                    disabled={uploading}
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
                    disabled={uploading}
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
                    disabled={uploading}
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
                      href={parent.facebook.startsWith('http') ? parent.facebook : `https://facebook.com/${parent.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {parent.facebook.includes('facebook.com/') ?
                        parent.facebook.split('facebook.com/')[1] :
                        parent.facebook}
                    </a>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Edit Actions */}
          {isEditing && (
            <div className="edit-actions">
              <button
                className="save-btn"
                onClick={handleSave}
                disabled={uploading}
              >
                {uploading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                className="cancel-btn"
                onClick={handleCancel}
                disabled={uploading}
              >
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