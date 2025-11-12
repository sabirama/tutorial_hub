import React, { useState } from 'react';
import "../../../../../assets/css/TutorsDirectory.css"
import apiCall from '../../../../../middlewares/api/axios';

const TutorsDirectory = () => {
  const [tutors, setTutors] = useState([
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@email.com',
      contact: '(555) 123-4567',
      location: 'New York, NY',
      subjects: ['Mathematics', 'Algebra', 'Calculus', 'Geometry'],
      hourlyRate: 35,
      experience: '5 years',
      education: 'BS Mathematics, University of California',
      rating: 4.8,
      totalRatings: 127,
      totalSessions: 245,
      bio: 'Experienced mathematics tutor with 5+ years of teaching algebra, calculus, and geometry. Passionate about making math accessible and enjoyable for all students.',
      availability: ['Monday', 'Wednesday', 'Friday'],
      languages: ['English', 'Spanish'],
      isVerified: true,
      joinDate: '2023-01-15',
      responseTime: 'Within 2 hours'
    },
    {
      id: 2,
      name: 'Maria Garcia',
      email: 'maria.g@email.com',
      contact: '(555) 234-5678',
      location: 'San Francisco, CA',
      subjects: ['Physics', 'Chemistry', 'Biology'],
      hourlyRate: 40,
      experience: '3 years',
      education: 'MS Physics, Stanford University',
      rating: 4.9,
      totalRatings: 89,
      totalSessions: 156,
      bio: 'Physics graduate student with strong background in sciences. Specialized in making complex concepts easy to understand.',
      availability: ['Tuesday', 'Thursday', 'Saturday'],
      languages: ['English', 'French'],
      isVerified: true,
      joinDate: '2023-02-20',
      responseTime: 'Within 1 hour'
    },
    {
      id: 3,
      name: 'David Kim',
      email: 'david.kim@email.com',
      contact: '(555) 345-6789',
      location: 'Chicago, IL',
      subjects: ['Computer Science', 'Programming', 'Web Development'],
      hourlyRate: 45,
      experience: '4 years',
      education: 'BS Computer Science, MIT',
      rating: 4.7,
      totalRatings: 203,
      totalSessions: 312,
      bio: 'Software engineer turned educator. Passionate about teaching programming and computer science concepts to students of all levels.',
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      languages: ['English', 'Korean'],
      isVerified: true,
      joinDate: '2023-03-10',
      responseTime: 'Within 30 minutes'
    },
    {
      id: 4,
      name: 'Sarah Williams',
      email: 'sarah.w@email.com',
      contact: '(555) 456-7890',
      location: 'Boston, MA',
      subjects: ['English', 'Literature', 'Writing', 'Grammar'],
      hourlyRate: 30,
      experience: '2 years',
      education: 'BA English, Harvard University',
      rating: 4.5,
      totalRatings: 67,
      totalSessions: 98,
      bio: 'English literature graduate with passion for teaching language arts. Focus on improving writing skills and reading comprehension.',
      availability: ['Weekends'],
      languages: ['English'],
      isVerified: false,
      joinDate: '2023-04-05',
      responseTime: 'Within 4 hours'
    },
    {
      id: 5,
      name: 'James Brown',
      email: 'james.b@email.com',
      contact: '(555) 567-8901',
      location: 'Miami, FL',
      subjects: ['Biology', 'Chemistry', 'Anatomy'],
      hourlyRate: 38,
      experience: '6 years',
      education: 'MS Biology, University of Florida',
      rating: 4.6,
      totalRatings: 145,
      totalSessions: 267,
      bio: 'Biology specialist with medical background. Excellent at explaining biological processes and scientific concepts.',
      availability: ['Monday', 'Wednesday', 'Friday', 'Sunday'],
      languages: ['English', 'Spanish'],
      isVerified: true,
      joinDate: '2023-05-12',
      responseTime: 'Within 3 hours'
    },
    {
      id: 6,
      name: 'Lisa Chen',
      email: 'lisa.c@email.com',
      contact: '(555) 678-9012',
      location: 'Los Angeles, CA',
      subjects: ['History', 'Social Studies', 'Geography'],
      hourlyRate: 32,
      experience: '4 years',
      education: 'MA History, UCLA',
      rating: 4.4,
      totalRatings: 78,
      totalSessions: 134,
      bio: 'History enthusiast with focus on making past events engaging and relevant to modern students.',
      availability: ['Tuesday', 'Thursday', 'Saturday'],
      languages: ['English', 'Mandarin'],
      isVerified: true,
      joinDate: '2023-06-08',
      responseTime: 'Within 2 hours'
    }
  ]);

  async function getTutors() {
    const response = await apiCall({
      url: '/tutors',
      method: 'get',
    })
  }

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
    subject: '',
    preferredDate: '',
    preferredTime: '',
    message: ''
  });

  const allSubjects = [...new Set(tutors.flatMap(tutor => tutor.subjects))].sort();
  const allLocations = [...new Set(tutors.map(tutor => tutor.location))].sort();

  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = tutor.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         tutor.subjects.some(subject => subject.toLowerCase().includes(filters.search.toLowerCase())) ||
                         tutor.location.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesSubject = !filters.subject || tutor.subjects.includes(filters.subject);
    const matchesRate = !filters.maxRate || tutor.hourlyRate <= parseInt(filters.maxRate);
    const matchesRating = !filters.minRating || tutor.rating >= parseFloat(filters.minRating);
    const matchesLocation = !filters.location || tutor.location === filters.location;
    const matchesVerified = !filters.verifiedOnly || tutor.isVerified;

    return matchesSearch && matchesSubject && matchesRate && matchesRating && matchesLocation && matchesVerified;
  });

  const handleContactTutor = (tutor) => {
    setContactModal({ isOpen: true, tutor });
    setContactForm({
      childName: '',
      subject: tutor.subjects[0],
      preferredDate: '',
      preferredTime: '',
      message: `Hi ${tutor.name}, I'm interested in scheduling a tutoring session.`
    });
  };

  const handleSubmitContact = (e) => {
    e.preventDefault();
    // Here you would typically send the contact request to your backend
    alert(`Session request sent to ${contactModal.tutor.name}! They will contact you soon.`);
    setContactModal({ isOpen: false, tutor: null });
    setContactForm({
      childName: '',
      subject: '',
      preferredDate: '',
      preferredTime: '',
      message: ''
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : ''}`}
          >
            {star <= rating ? '★' : '☆'}
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
          filteredTutors.map(tutor => (
            <div key={tutor.id} className="tutor-card">
              <div className="tutor-header">
                <div className="tutor-basic-info">
                  <div className="avatar">
                    {tutor.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3>
                      {tutor.name}
                      {tutor.isVerified && <span className="verified-badge">✓</span>}
                    </h3>
                    <p>{tutor.location}</p>
                  </div>
                </div>
                <div className="tutor-rating">
                  {renderStars(tutor.rating)}
                  <span className="rating-text">
                    {tutor.rating} ({tutor.totalRatings} reviews)
                  </span>
                </div>
              </div>

              <div className="tutor-subjects">
                <h4>Subjects:</h4>
                <div className="subjects-list">
                  {tutor.subjects.map((subject, index) => (
                    <span key={index} className="subject-tag">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>

              <div className="tutor-details">
                <div className="detail-row">
                  <span className="label">Hourly Rate:</span>
                  <span className="value">${tutor.hourlyRate}/hr</span>
                </div>
                <div className="detail-row">
                  <span className="label">Experience:</span>
                  <span className="value">{tutor.experience}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Education:</span>
                  <span className="value">{tutor.education}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Response Time:</span>
                  <span className="value">{tutor.responseTime}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Languages:</span>
                  <span className="value">{tutor.languages.join(', ')}</span>
                </div>
              </div>

              <div className="tutor-bio">
                <p>{tutor.bio}</p>
              </div>

              <div className="tutor-stats">
                <div className="stat">
                  <span className="stat-number">{tutor.totalSessions}</span>
                  <span className="stat-label">Sessions</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{tutor.totalRatings}</span>
                  <span className="stat-label">Reviews</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{tutor.availability.length}</span>
                  <span className="stat-label">Days Available</span>
                </div>
              </div>

              <div className="card-actions">
                <button 
                  className="contact-btn"
                  onClick={() => handleContactTutor(tutor)}
                >
                  Contact for Session
                </button>
                <button className="save-btn">
                  Save Tutor
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Contact Modal */}
      {contactModal.isOpen && (
        <div className="modal-overlay">
          <div className="contact-modal">
            <div className="modal-header">
              <h2>Contact {contactModal.tutor?.name}</h2>
              <button 
                className="close-btn"
                onClick={() => setContactModal({ isOpen: false, tutor: null })}
              >
                ×
              </button>
            </div>

            <div className="tutor-preview">
              <div className="avatar">
                {contactModal.tutor?.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h4>{contactModal.tutor?.name}</h4>
                <p>{contactModal.tutor?.subjects.join(', ')} • ${contactModal.tutor?.hourlyRate}/hr</p>
                <div className="tutor-rating-small">
                  {renderStars(contactModal.tutor?.rating)}
                  <span>{contactModal.tutor?.rating}</span>
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
                    {contactModal.tutor?.subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="preferredDate">Preferred Date</label>
                  <input
                    type="date"
                    id="preferredDate"
                    value={contactForm.preferredDate}
                    onChange={(e) => setContactForm(prev => ({ ...prev, preferredDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="preferredTime">Preferred Time</label>
                  <select
                    id="preferredTime"
                    value={contactForm.preferredTime}
                    onChange={(e) => setContactForm(prev => ({ ...prev, preferredTime: e.target.value }))}
                  >
                    <option value="">Any time</option>
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