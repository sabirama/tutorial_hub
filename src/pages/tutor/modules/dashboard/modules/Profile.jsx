import { useState, useEffect } from 'react';
import "../../../../../assets/css/TutorsProfle.css"
import apiCall from '../../../../../middlewares/api/axios';
import { getUserId, getToken } from '../../../../../middlewares/auth/auth';
import { useNavigate } from 'react-router-dom';

const TutorProfile = () => {
    const navigate = useNavigate();

    if (!sessionStorage.getItem("token")) {
        navigate('/');
    }

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
    const [allSubjects, setAllSubjects] = useState([]);
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [searchSubject, setSearchSubject] = useState("");
    const [newImageFile, setNewImageFile] = useState(null);

    useEffect(() => {
        fetchTutorProfile();
        fetchAllSubjects();
    }, []);

    const fetchTutorProfile = async () => {
        try {
            const tutorId = getUserId();
            const token = getToken();

            console.log('Fetching tutor profile for ID:', tutorId);

            const profileResponse = await apiCall({
                method: 'get',
                url: `/tutors/${tutorId}/profile`,
                headers: { token }
            });

            console.log('Tutor profile response:', profileResponse);

            if (profileResponse.data.success && profileResponse.data.data) {
                const tutorData = profileResponse.data.data;

                const formattedTutor = {
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
                    hourly_rate: tutorData.hourly_rate || "0 Php",
                    subjects_offered: tutorData.subjects || [],
                    rating: tutorData.rating || 0,
                    total_sessions: tutorData.stats?.total_sessions || 0,
                    availability: tutorData.availability || [],
                    languages: tutorData.languages || ["English"],
                    join_date: tutorData.created_at || new Date().toISOString()
                };

                setTutor(formattedTutor);
                setEditForm(formattedTutor);
            } else {
                console.error('No tutor data found in response');
                alert('Failed to load tutor profile: No data received');
            }
        } catch (error) {
            console.error('Error fetching tutor profile:', error);
            console.error('Error details:', error.response?.data);
            alert('Failed to load tutor profile: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const fetchAllSubjects = async () => {
        try {
            const response = await apiCall({
                method: 'get',
                url: '/subjects',
                headers: { token: getToken() }
            });

            if (response.data.success) {
                const subjects = response.data.data.map(subject => subject.subject || subject.name);
                setAllSubjects(subjects);
                console.log('All subjects loaded:', subjects);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
            const defaultSubjects = [
                "Mathematics", "Science", "English", "History", "Physics",
                "Chemistry", "Biology", "Computer Science", "Programming",
                "Statistics", "Calculus", "Algebra", "Geometry", "Economics",
                "Accounting", "Business Studies", "Psychology", "Sociology"
            ];
            setAllSubjects(defaultSubjects);
        }
    };

    useEffect(() => {
        if (isEditing) {
            const selected = editForm.subjects_offered || [];
            const available = allSubjects.filter(subject =>
                !selected.includes(subject) &&
                subject.toLowerCase().includes(searchSubject.toLowerCase())
            );
            setAvailableSubjects(available);
        }
    }, [isEditing, editForm.subjects_offered, allSubjects, searchSubject]);

    const handleEditChange = (field, value) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    const addSubject = (subject) => {
        if (!editForm.subjects_offered.includes(subject)) {
            const updatedSubjects = [...editForm.subjects_offered, subject];
            setEditForm(prev => ({ ...prev, subjects_offered: updatedSubjects }));
            setSearchSubject("");
        }
    };

    const removeSubject = (subjectToRemove) => {
        const updatedSubjects = editForm.subjects_offered.filter(subject => subject !== subjectToRemove);
        setEditForm(prev => ({ ...prev, subjects_offered: updatedSubjects }));
    };

    const addNewSubject = () => {
        if (searchSubject.trim() && !editForm.subjects_offered.includes(searchSubject.trim())) {
            const newSubject = searchSubject.trim();
            const updatedSubjects = [...editForm.subjects_offered, newSubject];
            setEditForm(prev => ({ ...prev, subjects_offered: updatedSubjects }));

            if (!allSubjects.includes(newSubject)) {
                setAllSubjects(prev => [...prev, newSubject]);
            }

            setSearchSubject("");
        }
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Please select a valid image file (JPEG, PNG, GIF, WebP)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        // Store the file for later upload
        setNewImageFile(file);

        // Create object URL for preview
        const objectUrl = URL.createObjectURL(file);
        setEditForm(prev => ({ ...prev, profile_image: objectUrl }));

        // Also update tutor state for immediate preview
        setTutor(prev => ({ ...prev, profile_image: objectUrl }));

        console.log('Image selected for upload:', file.name);
    };

    const uploadProfileImage = async () => {
        if (!newImageFile) {
            return null;
        }

        try {
            const formData = new FormData();
            formData.append('profile_image', newImageFile);
            formData.append('tutor_id', getUserId());

            console.log('Uploading tutor image file:', newImageFile.name);

            const response = await apiCall({
                method: 'post',
                url: '/tutors/upload-profile-image',
                data: formData,
                headers: {
                    'token': getToken()
                }
            });

            console.log('Upload response:', response.data);

            if (response.data.success) {
                const imageUrl = response.data.data.imageUrl ||
                    (response.data.data.tutor && response.data.data.tutor.profile_image);

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

    // Helper function to format image URL
    const formatImageUrl = (url) => {
        if (!url) return '';

        if (url.startsWith('blob:')) {
            return url; // Keep blob URLs for preview
        }

        if (url.startsWith('/uploads/')) {
            return import.meta.env.VITE_BASE_URL.replace('/api', "") + url;
        }

        return url;
    };

    const deleteProfileImage = async () => {
        try {
            const response = await apiCall({
                method: 'delete',
                url: `/tutors/${getUserId()}/profile-image`,
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

    const handleRemoveImage = () => {
        if (!window.confirm('Are you sure you want to remove your profile image?')) {
            return;
        }

        // Revoke object URL to prevent memory leaks
        if (editForm.profile_image && editForm.profile_image.startsWith('blob:')) {
            URL.revokeObjectURL(editForm.profile_image);
        }

        // Clear the stored file
        setNewImageFile(null);

        // Update states with empty string
        setEditForm(prev => ({ ...prev, profile_image: '' }));
        setTutor(prev => ({ ...prev, profile_image: '' }));

        alert('Profile image will be removed when you save changes');
    };

    const handleSave = async () => {
        try {
            const tutorId = getUserId();
            const token = getToken();

            setUploading(true);

            console.log('Saving tutor profile...');

            let newImageUrl = null;

            // 1. Handle image upload/removal separately
            if (newImageFile) {
                console.log('Uploading new image to separate endpoint...');
                const imageUrl = await uploadProfileImage();
                if (!imageUrl) {
                    setUploading(false);
                    alert('Failed to upload profile image');
                    return;
                }
                newImageUrl = imageUrl;
                // Update local state with the new image URL
                setEditForm(prev => ({ ...prev, profile_image: imageUrl }));
            } else if (editForm.profile_image === '' && tutor.profile_image) {
                console.log('Deleting existing image...');
                const success = await deleteProfileImage();
                if (!success) {
                    setUploading(false);
                    alert('Failed to delete profile image');
                    return;
                }
                newImageUrl = ''; // Mark as empty
            }

            // 2. Update tutor profile data
            const updateData = {
                full_name: editForm.full_name || '',
                contact_number: editForm.contact_number || '',
                email: editForm.email || '',
                course: editForm.course || '',
                location: editForm.location || '',
                facebook: editForm.facebook || '',
                bio: editForm.bio || '',
                hourly_rate: editForm.hourly_rate || '',
            };

            // If we have a new image URL (uploaded or deleted), include it in the update
            if (newImageUrl !== null) {
                updateData.profile_image = newImageUrl === '' ? null : newImageUrl;
            }

            // Remove empty fields
            Object.keys(updateData).forEach(key => {
                if (updateData[key] === '' || updateData[key] === null) {
                    delete updateData[key];
                }
            });

            console.log('Updating tutor data:', updateData);

            // Update tutor profile
            const profileResponse = await apiCall({
                method: 'put',
                url: `/tutors/${tutorId}`,
                data: updateData,
                headers: { 'token': token }
            });

            console.log('Profile update response:', profileResponse);

            // Update subjects if they have changed
            if (JSON.stringify(editForm.subjects_offered) !== JSON.stringify(tutor.subjects_offered)) {
                try {
                    // First, get subject IDs for the selected subjects
                    const subjectsResponse = await apiCall({
                        method: 'get',
                        url: '/subjects',
                        headers: { token }
                    });

                    if (subjectsResponse.data.success) {
                        // Create array of subject IDs
                        const subjectIds = [];
                        const subjectsData = subjectsResponse.data.data;

                        editForm.subjects_offered.forEach(subjectName => {
                            const foundSubject = subjectsData.find(s =>
                                s.subject === subjectName || s.name === subjectName
                            );
                            if (foundSubject) {
                                subjectIds.push(foundSubject.id);
                            }
                        });

                        // Update tutor subjects
                        await apiCall({
                            method: 'put',
                            url: `/tutors/${tutorId}/subjects`,
                            data: { subjects: subjectIds },
                            headers: { 'token': token }
                        });
                    }
                } catch (subjectError) {
                    console.error('Error updating subjects:', subjectError);
                    // Continue with profile update even if subjects update fails
                }
            }

            if (profileResponse.data.success) {
                // Update the tutor state with the new image URL if uploaded
                const updatedTutor = {
                    ...tutor,
                    ...updateData,
                    subjects_offered: editForm.subjects_offered
                };

                // If we uploaded a new image, use the server URL instead of blob URL
                if (newImageUrl) {
                    updatedTutor.profile_image = newImageUrl;
                }

                setTutor(updatedTutor);

                // Clean up
                if (newImageFile) {
                    URL.revokeObjectURL(editForm.profile_image);
                    setNewImageFile(null);
                }

                setIsEditing(false);
                alert('Profile updated successfully!');

                // Refresh the profile to get latest data including image
                fetchTutorProfile();
            } else {
                alert('Failed to update profile: ' + (profileResponse.data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error updating tutor profile:', error);
            console.error('Error details:', error.response?.data);
            alert('Failed to update profile: ' + (error.response?.data?.error || error.message));
        } finally {
            setUploading(false);
        }
    };

    const handleCancel = () => {
        if (editForm.profile_image && editForm.profile_image.startsWith('blob:') &&
            editForm.profile_image !== tutor.profile_image) {
            URL.revokeObjectURL(editForm.profile_image);
        }

        setEditForm(tutor);
        setIsEditing(false);
        setSearchSubject("");
        setNewImageFile(null);
    };

    const stats = [
        { label: "Rating", value: tutor.rating, icon: "⭐" },
        { label: "Sessions", value: tutor.total_sessions, icon: "📚" },
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

    // Helper function to get initials from full name
    const getInitials = (name) => {
        if (!name) return 'T';
        return name.split(' ').map(n => n && n[0]).join('').toUpperCase();
    };

    return (
        <div className="tutor-profile">
            <div className="profile-header">
                <h1>Tutor Profile</h1>
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
                                {(editForm.profile_image || tutor.profile_image) ? (
                                    <div className="image-wrapper">
                                        <img
                                            src={formatImageUrl(isEditing ? editForm.profile_image : tutor.profile_image)}
                                            alt={editForm.full_name || tutor.full_name || 'Profile'}
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
                                            {getInitials(isEditing ? editForm.full_name : tutor.full_name)}
                                        </div>
                                        {uploading && <div className="upload-overlay">Uploading...</div>}
                                    </div>
                                ) : (
                                    <div className="avatar-large">
                                        {getInitials(isEditing ? editForm.full_name : tutor.full_name)}
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

                                    {(editForm.profile_image || tutor.profile_image) && (
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
                                <>
                                    <input
                                        type="text"
                                        value={editForm.full_name}
                                        onChange={(e) => handleEditChange('full_name', e.target.value)}
                                        className="edit-input"
                                        placeholder="Full Name"
                                        disabled={uploading}
                                    />
                                    <input
                                        type="text"
                                        value={editForm.course}
                                        onChange={(e) => handleEditChange('course', e.target.value)}
                                        className="edit-input"
                                        placeholder="Course/Qualification"
                                        disabled={uploading}
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
                                        disabled={uploading}
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
                                        disabled={uploading}
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
                                        disabled={uploading}
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
                                        disabled={uploading}
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
                                            href={tutor.facebook.startsWith('http') ? tutor.facebook : `https://facebook.com/${tutor.facebook}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {tutor.facebook.includes('facebook.com/') ?
                                                tutor.facebook.split('facebook.com/')[1] :
                                                tutor.facebook}
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
                                disabled={uploading}
                            />
                        ) : (
                            <p>{tutor.bio || "No bio provided yet."}</p>
                        )}
                    </div>

                    {/* Subjects - Editable Section */}
                    <div className="subjects-card">
                        <h3>Subjects Offered</h3>
                        {isEditing ? (
                            <div className="editable-subjects">
                                {/* Selected Subjects */}
                                <div className="selected-subjects">
                                    <h4>Your Subjects:</h4>
                                    <div className="subjects-list">
                                        {editForm.subjects_offered && editForm.subjects_offered.length > 0 ? (
                                            editForm.subjects_offered.map((subject, index) => (
                                                <span key={index} className="subject-tag editable">
                                                    {subject}
                                                    <button
                                                        className="remove-subject-btn"
                                                        onClick={() => removeSubject(subject)}
                                                        disabled={uploading}
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))
                                        ) : (
                                            <p className="no-data">No subjects selected yet.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Add Subjects Section */}
                                <div className="add-subjects">
                                    <h4>Add Subjects:</h4>
                                    <div className="subject-search">
                                        <input
                                            type="text"
                                            value={searchSubject}
                                            onChange={(e) => setSearchSubject(e.target.value)}
                                            placeholder="Search or add new subject..."
                                            className="subject-search-input"
                                            disabled={uploading}
                                        />
                                        <button
                                            className="add-subject-btn"
                                            onClick={addNewSubject}
                                            disabled={!searchSubject.trim() || uploading}
                                        >
                                            Add New
                                        </button>
                                    </div>

                                    {/* Available Subjects List */}
                                    {searchSubject && availableSubjects.length > 0 && (
                                        <div className="available-subjects">
                                            <h5>Available Subjects:</h5>
                                            <div className="subject-suggestions">
                                                {availableSubjects.slice(0, 5).map((subject, index) => (
                                                    <button
                                                        key={index}
                                                        className="subject-suggestion"
                                                        onClick={() => addSubject(subject)}
                                                        disabled={uploading}
                                                    >
                                                        {subject}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Common Subjects Quick Add */}
                                    <div className="common-subjects">
                                        <h5>Quick Add:</h5>
                                        <div className="quick-subjects">
                                            {["Mathematics", "Science", "English", "History", "Physics", "Programming"]
                                                .filter(subject => !editForm.subjects_offered.includes(subject))
                                                .slice(0, 6)
                                                .map((subject, index) => (
                                                    <button
                                                        key={index}
                                                        className="quick-subject-btn"
                                                        onClick={() => addSubject(subject)}
                                                        disabled={uploading}
                                                    >
                                                        + {subject}
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // View Mode
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
                        )}
                    </div>

                    {/* Additional Info */}
                    <div className="info-grid">
                        <div className="info-card">
                            <h4>Education</h4>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editForm.course}
                                    onChange={(e) => handleEditChange('education', e.target.value)}
                                    className="edit-input"
                                    placeholder="Educational background"
                                    disabled={uploading}
                                />
                            ) : (
                                <p>{tutor.course || "No education information provided"}</p>
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
                                    disabled={uploading}
                                />
                            ) : (
                                <p>{tutor.hourly_rate || "Rate not specified"}</p>
                            )}
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

export default TutorProfile;