import { useState } from 'react';
import "../.././../../../assets/css/TableManager.css"

const ParentsManager = () => {
  const [parents, setParents] = useState([
    {
      id: 1,
      fullName: 'Sarah Johnson',
      rating: 4.8,
      location: 'New York, NY',
      email: 'sarah.j@email.com',
      phone: '(555) 123-4567',
      joinDate: '2023-01-15',
      status: 'active'
    },
    {
      id: 2,
      fullName: 'Michael Chen',
      rating: 4.5,
      location: 'San Francisco, CA',
      email: 'michael.c@email.com',
      phone: '(555) 234-5678',
      joinDate: '2023-02-20',
      status: 'active'
    },
    {
      id: 3,
      fullName: 'Emily Davis',
      rating: 4.9,
      location: 'Chicago, IL',
      email: 'emily.d@email.com',
      phone: '(555) 345-6789',
      joinDate: '2023-03-10',
      status: 'inactive'
    },
    {
      id: 4,
      fullName: 'Robert Wilson',
      rating: 4.2,
      location: 'Miami, FL',
      email: 'robert.w@email.com',
      phone: '(555) 456-7890',
      joinDate: '2023-04-05',
      status: 'active'
    },
    {
      id: 5,
      fullName: 'Lisa Martinez',
      rating: 4.7,
      location: 'Austin, TX',
      email: 'lisa.m@email.com',
      phone: '(555) 567-8901',
      joinDate: '2023-05-12',
      status: 'active'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter parents based on search term and status
  const filteredParents = parents.filter(parent => {
    const matchesSearch = parent.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         parent.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         parent.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || parent.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (parentId, newStatus) => {
    setParents(parents.map(parent => 
      parent.id === parentId ? { ...parent, status: newStatus } : parent
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
        <h1>Parents Management</h1>
        <p>Manage and view all parent accounts</p>
      </div>

      {/* Controls */}
      <div className="controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, location, or email..."
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

      {/* Parents List */}
      <div className="table-list">
        {filteredParents.length === 0 ? (
          <div className="no-results">
            <p>No parents found matching your criteria.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="listed-tables">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Rating</th>
                  <th>Location</th>
                  <th>Contact</th>
                  <th>Join Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParents.map(parent => (
                  <tr key={parent.id} className={parent.status}>
                    <td className="parent-name">
                      <div className="name-avatar">
                        <div className="avatar">
                          {parent.fullName.split(' ').map(n => n[0]).join('')}
                        </div>
                        {parent.fullName}
                      </div>
                    </td>
                    <td className="rating-column">
                      {renderStars(parent.rating)}
                    </td>
                    <td className="location-column">
                      {parent.location}
                    </td>
                    <td className="contact-column">
                      <div className="contact-info">
                        <div>{parent.email}</div>
                        <div className="phone">{parent.phone}</div>
                      </div>
                    </td>
                    <td className="join-date">
                      {new Date(parent.joinDate).toLocaleDateString()}
                    </td>
                    <td className="status-column">
                      <span className={`status-badge ${parent.status}`}>
                        {parent.status}
                      </span>
                    </td>
                    <td className="actions-column">
                      <select
                        value={parent.status}
                        onChange={(e) => handleStatusChange(parent.id, e.target.value)}
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

      {/* Summary */}
      <div className="summary">
        <p>
          Showing {filteredParents.length} of {parents.length} parents
        </p>
      </div>
    </div>
  );
};

export default ParentsManager;