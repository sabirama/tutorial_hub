import { useState, useEffect } from 'react';
import "../../../../../assets/css/TutorsDirectory.css"
import apiCall from '../../../../../middlewares/api/axios';
import { getToken, getUserId } from '../../../../../middlewares/auth/auth';
import { useNavigate } from 'react-router-dom';

const TutorsDirectory = () => {
    const navigate = useNavigate();

    if (!sessionStorage.getItem("token")) {
        navigate('/');
    }

    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [children, setChildren] = useState([]);
    const [tutorSubjects, setTutorSubjects] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [detailedTutorInfo, setDetailedTutorInfo] = useState(null);
    const [tutorSessions, setTutorSessions] = useState([]);
    const [tutorReviews, setTutorReviews] = useState([]);
    const [allSubjects, setAllSubjects] = useState([]);
    const [allLocations, setAllLocations] = useState([]);

    // Fetch tutors on component mount
    useEffect(() => {
        async function fetchTutors() {
            try {
                const response = await apiCall({
                    method: 'get',
                    url: `/tutors`,
                });
                
                console.log('Tutors API response:', response.data);
                
                if (response.data && response.data.success) {
                    const tutorsData = response.data.data || [];
                    console.log('Tutors data:', tutorsData);
                    setTutors(tutorsData);
                    
                    // Extract unique subjects
                    const subjectsSet = new Set();
                    tutorsData.forEach(tutor => {
                        if (tutor.subjects && Array.isArray(tutor.subjects)) {
                            tutor.subjects.forEach(subject => {
                                subjectsSet.add(subject);
                            });
                        }
                    });
                    setAllSubjects(Array.from(subjectsSet).sort());
                    
                    // Extract unique locations
                    const locationsSet = new Set();
                    tutorsData.forEach(tutor => {
                        if (tutor.location) {
                            locationsSet.add(tutor.location);
                        }
                    });
                    setAllLocations(Array.from(locationsSet).sort());
                } else {
                    console.error('Failed to fetch tutors:', response.data?.error);
                    setTutors([]);
                }
            } catch (error) {
                console.error('Error fetching tutors:', error);
                console.error('Error details:', error.response?.data);
                setTutors([]);
            } finally {
                setLoading(false);
            }
        }

        fetchTutors();
    }, []);

    const [filters, setFilters] = useState({
        search: '',
        subject: '',
        maxRate: '',
        minRating: '',
        location: '',
        verifiedOnly: false
    });

    const [contactModal, setContactModal] = useState({ isOpen: false, tutor: null });
    const [contactForm, setContactForm] = useState({
        childId: '',
        subjectId: '',
        preferredDate: '',
        preferredTime: '',
        message: ''
    });

    // Fetch detailed tutor information
    const fetchTutorDetails = async (tutorId) => {
        try {
            console.log('Fetching details for tutor ID:', tutorId);
            
            // Fetch tutor profile with subjects
            const tutorResponse = await apiCall({
                method: 'get',
                url: `/tutors/${tutorId}`,
            });
            
            console.log('Tutor details response:', tutorResponse.data);

            if (tutorResponse.data && tutorResponse.data.success) {
                const tutorData = tutorResponse.data.data;

                // Fetch tutor subjects from the correct endpoint
                let subjectsData = [];
                try {
                    const subjectsResponse = await apiCall({
                        method: 'get',
                        url: `/tutors/${tutorId}/subjects`,
                    });
                    subjectsData = subjectsResponse.data?.data || subjectsResponse.data || [];
                    console.log('Tutor subjects:', subjectsData);
                } catch (error) {
                    console.log('Could not fetch tutor subjects:', error);
                }

                // Fetch tutor ratings/reviews
                let reviewsData = [];
                try {
                    const ratingsResponse = await apiCall({
                        method: 'get',
                        url: `/tutors/${tutorId}/ratings`,
                    });
                    reviewsData = ratingsResponse.data?.data || ratingsResponse.data || [];
                    console.log('Tutor reviews:', reviewsData);
                } catch (error) {
                    console.log('Could not fetch tutor ratings:', error);
                }

                // Fetch tutor availability
                let availabilityData = [];
                try {
                    const availabilityResponse = await apiCall({
                        method: 'get',
                        url: `/tutors/${tutorId}/availability`,
                    });
                    availabilityData = availabilityResponse.data?.data || availabilityResponse.data || [];
                    console.log('Tutor availability:', availabilityData);
                } catch (error) {
                    console.log('Could not fetch tutor availability:', error);
                }

                // Combine all data
                const detailedInfo = {
                    ...tutorData,
                    subjects: subjectsData.map(s => s.subject || s.name || s),
                    reviews: reviewsData,
                    availability: availabilityData
                };
                
                console.log('Combined tutor info:', detailedInfo);
                setDetailedTutorInfo(detailedInfo);

                // Fetch recent sessions (if any)
                try {
                    const sessionsResponse = await apiCall({
                        method: 'get',
                        url: `/tutors/${tutorId}/sessions`,
                        params: { status: 'completed', limit: 5 }
                    });
                    setTutorSessions(sessionsResponse.data?.data || sessionsResponse.data || []);
                } catch (error) {
                    console.log('Could not fetch sessions:', error);
                    setTutorSessions([]);
                }

            } else {
                console.error('No tutor data found');
                alert('Could not load tutor details.');
            }

        } catch (error) {
            console.error('Error fetching tutor details:', error);
            console.error('Error details:', error.response?.data);
            alert('Could not load tutor details. Please try again.');
        }
    };

    const handleViewTutorDetails = (tutor) => {
        fetchTutorDetails(tutor.id);
    };

    const handleContactTutor = async (tutor) => {
        setContactModal({ isOpen: true, tutor });

        // Fetch children and tutor's offered subjects when modal opens
        try {
            const userId = getUserId();

            // Try to fetch children
            let childrenData = [];
            try {
                const childrenResponse = await apiCall({
                    method: 'get',
                    url: `/parents/${userId}/children`,
                    headers: {
                        token: getToken()
                    }
                });
                childrenData = childrenResponse.data?.data || childrenResponse.data || [];
            } catch (error) {
                console.log('Could not fetch children:', error);
            }
            setChildren(childrenData);

            // Fetch tutor's offered subjects from the correct endpoint
            let tutorSubjectsData = [];
            try {
                const tutorSubjectsResponse = await apiCall({
                    method: 'get',
                    url: `/tutors/${tutor.id}/subjects`,
                    headers: {
                        token: getToken()
                    }
                });
                tutorSubjectsData = tutorSubjectsResponse.data?.data || tutorSubjectsResponse.data || [];
                console.log('Fetched tutor subjects for contact:', tutorSubjectsData);
            } catch (error) {
                console.log('Could not fetch tutor subjects:', error);
                // Fallback to tutor's subjects if API call fails
                if (tutor.subjects && Array.isArray(tutor.subjects)) {
                    tutorSubjectsData = tutor.subjects.map((subject, index) => ({
                        id: index,
                        subject: subject
                    }));
                }
            }
            setTutorSubjects(tutorSubjectsData);

        } catch (error) {
            console.error('Error fetching modal data:', error);
        }

        // Set initial form values
        setContactForm({
            childId: '',
            subjectId: '',
            preferredDate: '',
            preferredTime: '',
            message: `Hi ${tutor.full_name || tutor.tutor_name}, I'm interested in scheduling a tutoring session.`
        });
    };

    const handleSubmitContact = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Create session with pending status
            const sessionData = {
                parent_id: getUserId(),
                tutor_id: contactModal.tutor.id,
                child_id: contactForm.childId || null,
                subject_id: contactForm.subjectId || null,
                date: contactForm.preferredDate,
                time: contactForm.preferredTime,
                status: 'pending',
                location: 'Online',
                notes: contactForm.message,
                hourly_rate: contactModal.tutor?.hourly_rate || contactModal.tutor?.hourlyRate || '0',
                duration: '1'
            };

            console.log('Sending session request:', sessionData);

            const response = await apiCall({
                method: 'post',
                url: '/sessions',
                data: sessionData,
                headers: {
                    token: getToken()
                }
            });

            console.log('Session request response:', response.data);

            if (response.data && response.data.success) {
                const tutorName = contactModal.tutor?.full_name || contactModal.tutor?.tutor_name;
                alert(`Session request sent to ${tutorName}! They will contact you soon.`);
                setContactModal({ isOpen: false, tutor: null });
                setContactForm({
                    childId: '',
                    subjectId: '',
                    preferredDate: '',
                    preferredTime: '',
                    message: ''
                });
            } else {
                alert('Failed to send session request: ' + (response.data?.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error creating session:', error);
            console.error('Error details:', error.response?.data);
            alert('Failed to send session request: ' + 
                (error.response?.data?.error || error.response?.data?.message || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStars = (rating) => {
        const numericRating = parseFloat(rating) || 0;
        return (
            <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={`star ${star <= numericRating ? 'filled' : ''}`}
                    >
                        {star <= numericRating ? '★' : '☆'}
                    </span>
                ))}
            </div>
        );
    };

    // Safe filtering that handles API data structure correctly
    const filteredTutors = tutors.filter(tutor => {
        if (!tutor) return false;

        const searchTerm = filters.search.toLowerCase();
        const matchesSearch =
            (tutor.full_name?.toLowerCase().includes(searchTerm)) ||
            (tutor.tutor_name?.toLowerCase().includes(searchTerm)) ||
            (tutor.email?.toLowerCase().includes(searchTerm)) ||
            (tutor.location?.toLowerCase().includes(searchTerm)) ||
            (tutor.course?.toLowerCase().includes(searchTerm)) ||
            (tutor.subjects?.some(subject => 
                subject.toLowerCase().includes(searchTerm)
            ));

        const matchesSubject = !filters.subject ||
            (tutor.subjects && tutor.subjects.includes(filters.subject));

        const matchesRate = !filters.maxRate ||
            (tutor.hourly_rate && tutor.hourly_rate <= parseInt(filters.maxRate));

        const matchesRating = !filters.minRating ||
            (tutor.rating && tutor.rating >= parseFloat(filters.minRating));

        const matchesLocation = !filters.location ||
            (tutor.location && tutor.location === filters.location);

        const matchesVerified = !filters.verifiedOnly ||
            (tutor.verified === true || tutor.verified === 1 || tutor.verified === 'true');

        return matchesSearch && matchesSubject && matchesRate && matchesRating &&
            matchesLocation && matchesVerified;
    });

    const clearFilters = () => {
        setFilters({
            search: '',
            subject: '',
            maxRate: '',
            minRating: '',
            location: '',
            verifiedOnly: false
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes || '00'} ${ampm}`;
    };

    if (loading) {
        return (
            <div className="tutors-directory">
                <div className="page-header">
                    <h1>Find Your Perfect Tutor</h1>
                    <p>Loading tutors...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="tutors-directory">
            <div className="page-header">
                <h1>Find Your Perfect Tutor</h1>
                <p>Browse our verified tutors and schedule sessions that fit your needs</p>
            </div>

            {/* Filters Section */}
            <div className="filters-section">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search by name, subject, or location..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="search-input"
                    />
                </div>

                <div className="filter-grid">
                    <select
                        value={filters.subject}
                        onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
                        className="filter-select"
                    >
                        <option value="">All Subjects</option>
                        {allSubjects.map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                        ))}
                    </select>

                    <select
                        value={filters.location}
                        onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                        className="filter-select"
                    >
                        <option value="">All Locations</option>
                        {allLocations.map(location => (
                            <option key={location} value={location}>{location}</option>
                        ))}
                    </select>

                    <select
                        value={filters.maxRate}
                        onChange={(e) => setFilters(prev => ({ ...prev, maxRate: e.target.value }))}
                        className="filter-select"
                    >
                        <option value="">Any Rate</option>
                        <option value="250">Up to 250 Php</option>
                        <option value="350">Up to 350 Php</option>
                        <option value="450">Up to 450 Php</option>
                        <option value="550">Up to 550 Php</option>
                    </select>

                    <select
                        value={filters.minRating}
                        onChange={(e) => setFilters(prev => ({ ...prev, minRating: e.target.value }))}
                        className="filter-select"
                    >
                        <option value="">Any Rating</option>
                        <option value="4.5">4.5+ Stars</option>
                        <option value="4.0">4.0+ Stars</option>
                        <option value="3.5">3.5+ Stars</option>
                        <option value="3.0">3.0+ Stars</option>
                    </select>

                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={filters.verifiedOnly}
                            onChange={(e) => setFilters(prev => ({ ...prev, verifiedOnly: e.target.checked }))}
                        />
                        Verified Only
                    </label>

                    <button className="clear-filters" onClick={clearFilters}>
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Results Summary */}
            <div className="results-summary">
                <p>
                    Showing {filteredTutors.length} of {tutors.length} tutors
                    {filters.search && ` for "${filters.search}"`}
                </p>
            </div>

            {/* Tutors Grid */}
            <div className="tutors-grid">
                {filteredTutors.length === 0 ? (
                    <div className="no-results">
                        <h3>No tutors found</h3>
                        <p>Try adjusting your filters or search terms</p>
                    </div>
                ) : (
                    filteredTutors.map(tutor => {
                        const tutorName = tutor.full_name || tutor.tutor_name || 'Unknown Tutor';
                        const tutorSubjectsList = tutor.subjects || ['General Tutoring'];
                        const tutorRating = parseFloat(tutor.rating) || 0;
                        const tutorLocation = tutor.location || 'Location not specified';
                        const tutorHourlyRate = tutor.hourly_rate || tutor.hourlyRate || 0;
                        const tutorExperience = tutor.experience || 'Not specified';
                        const tutorEducation = tutor.education || 'Not specified';
                        const isVerified = tutor.verified === true || tutor.verified === 1 || tutor.verified === 'true';

                        return (
                            <div key={tutor.id} className="tutor-card">
                                <div className="tutor-header">
                                    <div className="tutor-basic-info">
                                        <div className="avatar">
                                            {tutorName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </div>
                                        <div>
                                            <h3>
                                                {tutorName}
                                                {isVerified && <span className="verified-badge">✓ Verified</span>}
                                            </h3>
                                            <p>{tutorLocation}</p>
                                        </div>
                                    </div>
                                    <div className="tutor-rating">
                                        {renderStars(tutorRating)}
                                        <span className="rating-text">
                                            {tutorRating.toFixed(1)} Stars
                                        </span>
                                    </div>
                                </div>

                                <div className="tutor-subjects">
                                    <h4>Subjects:</h4>
                                    <div className="subjects-list">
                                        {tutorSubjectsList.map((subject, index) => (
                                            <span key={index} className="subject-tag">
                                                {subject}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="tutor-details">
                                    <div className="detail-row">
                                        <span className="label">Hourly Rate:</span>
                                        <span className="value">{tutorHourlyRate ? `${tutorHourlyRate} Php/hr` : 'Not Specified'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Experience:</span>
                                        <span className="value">{tutorExperience}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Education:</span>
                                        <span className="value">{tutorEducation}</span>
                                    </div>
                                </div>

                                <div className="card-actions">
                                    <button
                                        className="view-btn"
                                        onClick={() => handleViewTutorDetails(tutor)}
                                    >
                                        View Profile
                                    </button>
                                    <button
                                        className="contact-btn"
                                        onClick={() => handleContactTutor(tutor)}
                                    >
                                        Contact for Session
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Tutor Details Modal */}
            {detailedTutorInfo && (
                <div className="modal-overlay" onClick={() => setDetailedTutorInfo(null)}>
                    <div className="tutor-details-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Tutor Profile</h2>
                            <button
                                className="close-btn"
                                onClick={() => setDetailedTutorInfo(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="tutor-profile-content">
                            {/* Tutor Header */}
                            <div className="tutor-profile-header">
                                <div className="profile-avatar">
                                    {detailedTutorInfo.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'TT'}
                                </div>
                                <div className="profile-info">
                                    <h1>{detailedTutorInfo.full_name || detailedTutorInfo.tutor_name}</h1>
                                    <div className="profile-meta">
                                        <span className="location">{detailedTutorInfo.location || 'Location not specified'}</span>
                                        <span className="course">{detailedTutorInfo.course || 'Course not specified'}</span>
                                        {detailedTutorInfo.verified && 
                                            <span className="verified-tag">✓ Verified Tutor</span>
                                        }
                                    </div>
                                    <div className="profile-rating">
                                        {renderStars(detailedTutorInfo.rating)}
                                        <span className="rating-score">{parseFloat(detailedTutorInfo.rating || 0).toFixed(1)}</span>
                                        <span className="rating-count">
                                            ({detailedTutorInfo.reviews?.length || 0} reviews)
                                        </span>
                                    </div>
                                </div>
                                <div className="profile-rate">
                                    <div className="hourly-rate">
                                        <span className="rate-label">Hourly Rate</span>
                                        <span className="rate-amount">
                                            {detailedTutorInfo.hourly_rate || detailedTutorInfo.hourlyRate || '0'} Php/hr
                                        </span>
                                    </div>
                                    <button 
                                        className="book-btn"
                                        onClick={() => {
                                            setDetailedTutorInfo(null);
                                            handleContactTutor(detailedTutorInfo);
                                        }}
                                    >
                                        Book Session
                                    </button>
                                </div>
                            </div>

                            {/* Main Content Grid */}
                            <div className="profile-grid">
                                {/* Left Column */}
                                <div className="profile-left">
                                    {/* Bio Section */}
                                    <div className="profile-section">
                                        <h3>About Me</h3>
                                        <div className="bio-content">
                                            {detailedTutorInfo.bio || 'No bio available.'}
                                        </div>
                                    </div>

                                    {/* Subjects Section */}
                                    <div className="profile-section">
                                        <h3>Subjects Offered</h3>
                                        <div className="subjects-grid">
                                            {detailedTutorInfo.subjects && detailedTutorInfo.subjects.length > 0 ? (
                                                detailedTutorInfo.subjects.map((subject, index) => (
                                                    <div key={index} className="subject-item">
                                                        <span className="subject-icon">📚</span>
                                                        <span className="subject-name">{subject}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p>No subjects listed.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Experience & Education */}
                                    <div className="profile-section">
                                        <h3>Qualifications</h3>
                                        <div className="qualifications">
                                            <div className="qual-item">
                                                <h4>Education</h4>
                                                <p>{detailedTutorInfo.education || 'Not specified'}</p>
                                            </div>
                                            <div className="qual-item">
                                                <h4>Teaching Experience</h4>
                                                <p>{detailedTutorInfo.experience || 'Not specified'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="profile-right">
                                    {/* Availability */}
                                    <div className="profile-section">
                                        <h3>Availability</h3>
                                        {detailedTutorInfo.availability && detailedTutorInfo.availability.length > 0 ? (
                                            <div className="availability-list">
                                                {detailedTutorInfo.availability.map((slot, index) => (
                                                    <div key={index} className="time-slot">
                                                        <span className="day">{slot.day || slot.weekday || 'Flexible'}</span>
                                                        <span className="time">
                                                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p>Contact tutor for availability.</p>
                                        )}
                                    </div>

                                    {/* Contact Info */}
                                    <div className="profile-section">
                                        <h3>Contact Information</h3>
                                        <div className="contact-info">
                                            <div className="contact-item">
                                                <span className="contact-label">Email:</span>
                                                <span className="contact-value">{detailedTutorInfo.email || 'Not provided'}</span>
                                            </div>
                                            <div className="contact-item">
                                                <span className="contact-label">Phone:</span>
                                                <span className="contact-value">{detailedTutorInfo.contact_number || 'Not provided'}</span>
                                            </div>
                                            {detailedTutorInfo.facebook && (
                                                <div className="contact-item">
                                                    <span className="contact-label">Facebook:</span>
                                                    <span className="contact-value">
                                                        <a href={detailedTutorInfo.facebook} target="_blank" rel="noopener noreferrer">
                                                            View Profile
                                                        </a>
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Recent Reviews */}
                                    <div className="profile-section">
                                        <h3>Recent Reviews</h3>
                                        {detailedTutorInfo.reviews && detailedTutorInfo.reviews.length > 0 ? (
                                            <div className="reviews-list">
                                                {detailedTutorInfo.reviews.slice(0, 3).map((review, index) => (
                                                    <div key={index} className="review-item">
                                                        <div className="review-header">
                                                            <div className="review-rating">
                                                                {renderStars(review.rating)}
                                                            </div>
                                                            <span className="review-date">
                                                                {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'Recent'}
                                                            </span>
                                                        </div>
                                                        <p className="review-comment">
                                                            {review.comment || review.review || 'No comment provided.'}
                                                        </p>
                                                        <span className="review-author">- {review.parent_name || review.student_name || 'Anonymous'}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p>No reviews yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="close-profile-btn"
                                onClick={() => setDetailedTutorInfo(null)}
                            >
                                Close
                            </button>
                            <button
                                className="contact-profile-btn"
                                onClick={() => {
                                    setDetailedTutorInfo(null);
                                    handleContactTutor(detailedTutorInfo);
                                }}
                            >
                                Contact This Tutor
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Contact Modal */}
            {contactModal.isOpen && contactModal.tutor && (
                <div className="modal-overlay">
                    <div className="contact-modal">
                        <div className="modal-header">
                            <h2>Request Session with {contactModal.tutor.full_name || contactModal.tutor.tutor_name}</h2>
                            <button
                                className="close-btn"
                                onClick={() => setContactModal({ isOpen: false, tutor: null })}
                            >
                                ×
                            </button>
                        </div>

                        <div className="tutor-preview">
                            <div className="avatar">
                                {(contactModal.tutor.full_name || contactModal.tutor.tutor_name || '')
                                    .split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div>
                                <h4>{contactModal.tutor.full_name || contactModal.tutor.tutor_name}</h4>
                                <p>{(contactModal.tutor.subjects || ['General Tutoring']).join(', ')} • 
                                   {contactModal.tutor.hourly_rate || contactModal.tutor.hourlyRate ? ` ${contactModal.tutor.hourly_rate || contactModal.tutor.hourlyRate} Php/hr` : ' Rate not specified'}</p>
                                <div className="tutor-rating-small">
                                    {renderStars(contactModal.tutor.rating)}
                                    <span>{parseFloat(contactModal.tutor.rating || 0).toFixed(1)}</span>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmitContact}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="childId">Select Child *</label>
                                    <select
                                        id="childId"
                                        value={contactForm.childId}
                                        onChange={(e) => setContactForm(prev => ({ ...prev, childId: e.target.value }))}
                                        required
                                    >
                                        <option value="">Select a child</option>
                                        {children.map(child => (
                                            <option key={child.id} value={child.id}>
                                                {child.name || child.full_name} {child.grade ? `- Grade ${child.grade}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {children.length === 0 && (
                                        <p className="form-help">No children found. Please add a child to your profile first.</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="subject">Subject *</label>
                                    <select
                                        id="subject"
                                        value={contactForm.subjectId}
                                        onChange={(e) => setContactForm(prev => ({ ...prev, subjectId: e.target.value }))}
                                        required
                                    >
                                        <option value="">Select a subject</option>
                                        {tutorSubjects.map(subject => (
                                            <option key={subject.id || subject.subject} value={subject.id || subject.subject}>
                                                {subject.subject || subject}
                                            </option>
                                        ))}
                                    </select>
                                    {tutorSubjects.length === 0 && (
                                        <p className="form-help">No subjects available for this tutor.</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="preferredDate">Preferred Date *</label>
                                    <input
                                        type="date"
                                        id="preferredDate"
                                        value={contactForm.preferredDate}
                                        onChange={(e) => setContactForm(prev => ({ ...prev, preferredDate: e.target.value }))}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="preferredTime">Preferred Time *</label>
                                    <select
                                        id="preferredTime"
                                        value={contactForm.preferredTime}
                                        onChange={(e) => setContactForm(prev => ({ ...prev, preferredTime: e.target.value }))}
                                        required
                                    >
                                        <option value="">Select a time</option>
                                        <option value="08:00">8:00 AM</option>
                                        <option value="09:00">9:00 AM</option>
                                        <option value="10:00">10:00 AM</option>
                                        <option value="11:00">11:00 AM</option>
                                        <option value="13:00">1:00 PM</option>
                                        <option value="14:00">2:00 PM</option>
                                        <option value="15:00">3:00 PM</option>
                                        <option value="16:00">4:00 PM</option>
                                        <option value="17:00">5:00 PM</option>
                                        <option value="18:00">6:00 PM</option>
                                        <option value="19:00">7:00 PM</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="message">Additional Message *</label>
                                <textarea
                                    id="message"
                                    value={contactForm.message}
                                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                                    rows="4"
                                    placeholder="Tell the tutor about your child's learning needs, goals, and any specific requirements..."
                                    required
                                />
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setContactModal({ isOpen: false, tutor: null })}
                                    disabled={isSubmitting}
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

export default TutorsDirectory;