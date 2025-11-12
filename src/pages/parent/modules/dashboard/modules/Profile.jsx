import { useState, useEffect } from 'react';
import "../../../../../assets/css/ParentsProfile.css"
import apiCall from '../../../../../middlewares/api/axios';
import { getUserId } from '../../../../../middlewares/auth/auth';

const ParentProfile = () => {
  const [parent, setParent] = useState({});
  const [children, setChildren] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editChildren, setEditChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchParentData() {
      try {
        const response = await apiCall({
          method: 'get',
          url: `/parents/${getUserId()}/profile`,
        });
        
        console.log('API Response:', response.data);
        
        if (response.data.success) {
          const profileData = response.data.data;
          setParent(profileData);
          setEditForm(profileData);
          setChildren(profileData.children || []);
          setEditChildren(profileData.children || []);
        }
      } catch (error) {
        console.error('Error fetching parent profile:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchParentData();
  }, []);

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
      // Remove ALL non-parent fields and auto-generated fields
      const { 
        children, 
        recent_sessions, 
        stats, 
        created_at, 
        updated_at, 
        ...parentData 
      } = editForm;
      
      const response = await apiCall({
        method: 'put',
        url: `/parents/${getUserId()}`,
        data: parentData
      });
      
      if (response.data.success) {
        setParent(response.data.data);
        
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
            <div className="profile-image">
              {parent.profile_image ? (
                <img src={parent.profile_image} alt={parent.full_name} />
              ) : (
                <div className="avatar-large">
                  {parent.full_name?.split(' ').map(n => n[0]).join('') || 'P'}
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
                    value={editForm.email || ''}
                    onChange={(e) => handleEditChange('email', e.target.value)}
                    className="edit-input"
                  />
                </div>
                <div className="contact-item">
                  <span>📞</span>
                  <input
                    type="text"
                    value={editForm.contact_number || ''}
                    onChange={(e) => handleEditChange('contact_number', e.target.value)}
                    className="edit-input"
                  />
                </div>
                <div className="contact-item">
                  <span>📍</span>
                  <input
                    type="text"
                    value={editForm.location || ''}
                    onChange={(e) => handleEditChange('location', e.target.value)}
                    className="edit-input"
                  />
                </div>
                <div className="contact-item">
                  <span>🔗</span>
                  <input
                    type="text"
                    value={editForm.facebook || ''}
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
                    {/* FIXED: Always show delete button when editing, even if only 1 child */}
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