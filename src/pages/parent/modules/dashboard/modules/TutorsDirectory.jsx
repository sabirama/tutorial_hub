import React, { useState, useEffect } from 'react';
import "../../../../../assets/css/TutorsDirectory.css"
import apiCall from '../../../../../middlewares/api/axios';
import { getUserId } from '../../../../../middlewares/auth/auth';

const TutorsDirectory = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTutors() {
      try {
        const response = await apiCall({
          method: 'get',
          url: `/tutors`,
        });
        setTutors(response.data.data || []);
      } catch (error) {
        console.error('Error fetching tutors:', error);
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
    childName: '',
    childId: '',
    subject: '',
    subjectId: '',
    preferredDate: '',
    preferredTime: '',
    message: ''
  });

  // Safe filtering that handles API data structure
  const filteredTutors = tutors.filter(tutor => {
    if (!tutor) return false;

    const matchesSearch =
      tutor?.tutor_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      tutor?.full_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      tutor?.location?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesSubject = !filters.subject ||
      (tutor.subjects && tutor.subjects.includes(filters.subject));

    const matchesRate = !filters.maxRate ||
      (tutor.hourlyRate && tutor.hourlyRate <= parseInt(filters.maxRate));

    const matchesRating = !filters.minRating ||
      (tutor.rating && tutor.rating >= parseFloat(filters.minRating));

    const matchesLocation = !filters.location ||
      tutor.location === filters.location;

    const matchesVerified = !filters.verifiedOnly ||
      (tutor.verified || tutor.isVerified);

    return matchesSearch && matchesSubject && matchesRate && matchesRating &&
      matchesLocation && matchesVerified;
  });

  // Safe extraction of subjects and locations
  const allSubjects = [...new Set(
    tutors.flatMap(tutor => tutor.subjects || [])
  )].sort();

  const allLocations = [...new Set(
    tutors.map(tutor => tutor.location).filter(Boolean)
  )].sort();

  const handleContactTutor = (tutor) => {
    setContactModal({ isOpen: true, tutor });
    setContactForm({
      childName: '',
      childId: '',
      subject: tutor.subjects?.[0] || '',
      subjectId: '',
      preferredDate: '',
      preferredTime: '',
      message: `Hi ${tutor.tutor_name || tutor.full_name}, I'm interested in scheduling a tutoring session.`
    });
  };

  const handleSubmitContact = async (e) => {
    e.preventDefault();
    try {
      const tutorName = contactModal.tutor?.tutor_name || contactModal.tutor?.full_name;
      
      // Create session with pending status
      const sessionData = {
        parent_id: getUserId(),
        tutor_id: contactModal.tutor.id,
        subject_id: contactForm.subjectId || 1, // You'll need to get the actual subject ID
        child_id: contactForm.childId || 1, // You'll need to get the actual child ID
        date: contactForm.preferredDate,
        time: contactForm.preferredTime,
        status: 'pending',
        location: 'Online', // Default or from form
        notes: contactForm.message,
        // These might be needed based on your session table structure
        tutor: tutorName,
        parent: '', // You might want to add parent name
        student: contactForm.childName
      };

      const response = await apiCall({
        method: 'post',
        url: '/sessions',
        data: sessionData
      });

      if (response.data.success) {
        alert(`Session request sent to ${tutorName}! They will contact you soon.`);
        setContactModal({ isOpen: false, tutor: null });
        setContactForm({
          childName: '',
          childId: '',
          subject: '',
          subjectId: '',
          preferredDate: '',
          preferredTime: '',
          message: ''
        });
      } else {
        alert('Failed to send session request: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to send session request: ' + (error.response?.data?.error || error.message));
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
            <option value="25">Up to 250 Php</option>
            <option value="35">Up to 350 Php</option>
            <option value="45">Up to 450 Php</option>
            <option value="55">Up to 550 Php</option>
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
            const tutorName = tutor.tutor_name || tutor.full_name || 'Unknown Tutor';
            const tutorSubjects = tutor.subjects || ['General Tutoring'];
            const tutorRating = parseFloat(tutor.rating) || 0;
            const tutorLocation = tutor.location || 'Location not specified';
            const tutorHourlyRate = tutor.hourlyRate;
            const tutorExperience = tutor.experience || 'Not specified';
            const tutorEducation = tutor.education || 'Not specified';
            const totalRatings = tutor.totalRatings || 0;
            const isVerified = tutor.verified || tutor.isVerified || false;

            return (
              <div key={tutor.id} className="tutor-card">
                <div className="tutor-header">
                  <div className="tutor-basic-info">
                    <div className="avatar">
                      {tutorName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3>
                        {tutorName}
                        {isVerified && <span className="verified-badge">✓</span>}
                      </h3>
                      <p>{tutorLocation}</p>
                    </div>
                  </div>
                  <div className="tutor-rating">
                    {renderStars(tutorRating)}
                    <span className="rating-text">
                      {tutorRating} ({totalRatings} reviews)
                    </span>
                  </div>
                </div>

                <div className="tutor-subjects">
                  <h4>Subjects:</h4>
                  <div className="subjects-list">
                    {tutorSubjects.map((subject, index) => (
                      <span key={index} className="subject-tag">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="tutor-details">
                  <div className="detail-row">
                    <span className="label">Hourly Rate:</span>
                    <span className="value">{tutorHourlyRate ? `${tutorHourlyRate}Php/hr` : 'Not Specified'}</span>
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

      {/* Contact Modal */}
      {contactModal.isOpen && (
        <div className="modal-overlay">
          <div className="contact-modal">
            <div className="modal-header">
              <h2>Request Session with {contactModal.tutor?.tutor_name || contactModal.tutor?.full_name}</h2>
              <button
                className="close-btn"
                onClick={() => setContactModal({ isOpen: false, tutor: null })}
              >
                ×
              </button>
            </div>

            <div className="tutor-preview">
              <div className="avatar">
                {(contactModal.tutor?.tutor_name || contactModal.tutor?.full_name || '')
                  .split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h4>{contactModal.tutor?.tutor_name || contactModal.tutor?.full_name}</h4>
                <p>{(contactModal.tutor?.subjects || ['General Tutoring']).join(', ')} • 
                  {contactModal.tutor?.hourlyRate ? `${contactModal.tutor.hourlyRate}Php/hr` : 'Rate not specified'}</p>
                <div className="tutor-rating-small">
                  {renderStars(contactModal.tutor?.rating)}
                  <span>{parseFloat(contactModal.tutor?.rating) || 0}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitContact}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="childName">Child's Name *</label>
                  <input
                    type="text"
                    id="childName"
                    value={contactForm.childName}
                    onChange={(e) => setContactForm(prev => ({ ...prev, childName: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <select
                    id="subject"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                    required
                  >
                    <option value="">Select a subject</option>
                    {(contactModal.tutor?.subjects || ['General Tutoring']).map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
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
                    <option value="10:00">10:00 AM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="18:00">6:00 PM</option>
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
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                >
                  Send Session Request
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