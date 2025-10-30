import { useState } from 'react';
import "../.././../../../assets/css/TableManager.css"

const TutorsManager = () => {
  const [tutors, setTutors] = useState([
    {
      id: 1,
      full_name: "John Smith",
      contact_number: "(555) 123-4567",
      email: "john.smith@email.com",
      course: "Mathematics",
      location: "New York, NY",
      facebook: "john.smith",
      username: "john_math",
      password: "encrypted_123",
      status: "active",
      joinDate: "2023-01-15",
      rating: 4.8
    },
    {
      id: 2,
      full_name: "Maria Garcia",
      contact_number: "(555) 234-5678",
      email: "maria.g@email.com",
      course: "Physics",
      location: "Los Angeles, CA",
      facebook: "maria.garcia",
      username: "maria_physics",
      password: "encrypted_456",
      status: "active",
      joinDate: "2023-02-20",
      rating: 4.9
    },
    {
      id: 3,
      full_name: "David Kim",
      contact_number: "(555) 345-6789",
      email: "david.kim@email.com",
      course: "Computer Science",
      location: "San Francisco, CA",
      facebook: "david.kim",
      username: "david_cs",
      password: "encrypted_789",
      status: "inactive",
      joinDate: "2023-03-10",
      rating: 4.7
    },
    {
      id: 4,
      full_name: "Sarah Williams",
      contact_number: "(555) 456-7890",
      email: "sarah.w@email.com",
      course: "Chemistry",
      location: "Chicago, IL",
      facebook: "sarah.williams",
      username: "sarah_chem",
      password: "encrypted_012",
      status: "active",
      joinDate: "2023-04-05",
      rating: 4.5
    },
    {
      id: 5,
      full_name: "James Brown",
      contact_number: "(555) 567-8901",
      email: "james.b@email.com",
      course: "Biology",
      location: "Miami, FL",
      facebook: "james.brown",
      username: "james_bio",
      password: "encrypted_345",
      status: "active",
      joinDate: "2023-05-12",
      rating: 4.6
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = tutor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutor.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutor.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutor.facebook.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tutor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (tutorId, newStatus) => {
    setTutors(tutors.map(tutor => 
      tutor.id === tutorId ? { ...tutor, status: newStatus } : tutor
    ));
  };

  const renderStars = (rating) => {
    return (
      <div className="stars">
        {[...Array(5)].map((_, index) => (
          <span
            key={index}
            className={index < Math.floor(rating) ? 'star filled' : 'star'}
          >
            {index < rating ? '★' : '☆'}
          </span>
        ))}
        <span className="rating-text">({rating})</span>
      </div>
    );
  };

  return (
    <div className="table-manager">
      <div className="manager-header">
        <h1>Tutors Management</h1>
        <p>Manage and view all tutor accounts</p>
      </div>

      <div className="controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, location, email, course, or Facebook..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="table-list">
        {filteredTutors.length === 0 ? (
          <div className="no-results">
            <p>No tutors found matching your criteria.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="listed-tables">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Rating</th>
                  <th>Course</th>
                  <th>Location</th>
                  <th>Contact</th>
                  <th>Facebook</th>
                  <th>Join Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTutors.map(tutor => (
                  <tr key={tutor.id} className={tutor.status}>
                    <td className="parent-name">
                      <div className="name-avatar">
                        <div className="avatar">
                          {tutor.full_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        {tutor.full_name}
                      </div>
                    </td>
                    <td className="rating-column">
                      {renderStars(tutor.rating)}
                    </td>
                    <td className="location-column">
                      {tutor.course}
                    </td>
                    <td className="location-column">
                      {tutor.location}
                    </td>
                    <td className="contact-column">
                      <div className="contact-info">
                        <div>{tutor.email}</div>
                        <div className="phone">{tutor.contact_number}</div>
                      </div>
                    </td>
                    <td className="contact-column">
                      <a 
                        href={`https://facebook.com/${tutor.facebook}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="facebook-link"
                      >
                        @{tutor.facebook}
                      </a>
                    </td>
                    <td className="join-date">
                      {new Date(tutor.joinDate).toLocaleDateString()}
                    </td>
                    <td className="status-column">
                      <span className={`status-badge ${tutor.status}`}>
                        {tutor.status}
                      </span>
                    </td>
                    <td className="actions-column">
                      <select
                        value={tutor.status}
                        onChange={(e) => handleStatusChange(tutor.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <button className="view-btn">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="summary">
        <p>
          Showing {filteredTutors.length} of {tutors.length} tutors
        </p>
      </div>
    </div>
  );
};

export default TutorsManager;