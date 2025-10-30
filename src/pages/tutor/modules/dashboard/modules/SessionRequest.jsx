import { useState } from 'react';
import "../../../../../assets/css/SessionRequest.css";

const SessionRequest = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'session_request',
      parentName: 'Sarah Johnson',
      parentEmail: 'sarah.j@email.com',
      parentContact: '(555) 123-4567',
      childName: 'Emma Johnson',
      childGrade: '8th Grade',
      subject: 'Mathematics',
      preferredDate: '2024-01-20',
      preferredTime: '14:00',
      message: 'Hi, my daughter Emma needs help with algebra. She\'s struggling with quadratic equations and could use some extra support.',
      status: 'pending',
      createdAt: '2024-01-15 14:30',
      hourlyRate: 35,
      duration: '1.5 hours',
      location: 'Online'
    },
    {
      id: 2,
      type: 'session_request',
      parentName: 'Michael Chen',
      parentEmail: 'michael.c@email.com',
      parentContact: '(555) 234-5678',
      childName: 'Alex Chen',
      childGrade: '10th Grade',
      subject: 'Physics',
      preferredDate: '2024-01-22',
      preferredTime: '16:00',
      message: 'My son Alex is preparing for his physics exam and needs help with Newtonian mechanics.',
      status: 'pending',
      createdAt: '2024-01-15 10:15',
      hourlyRate: 40,
      duration: '2 hours',
      location: 'Library'
    },
    {
      id: 3,
      type: 'session_request',
      parentName: 'Emily Davis',
      parentEmail: 'emily.d@email.com',
      parentContact: '(555) 345-6789',
      childName: 'Sophia Davis',
      childGrade: '9th Grade',
      subject: 'Mathematics',
      preferredDate: '2024-01-18',
      preferredTime: '15:00',
      message: 'Sophia needs help with geometry proofs. She understands the concepts but struggles with writing proper proofs.',
      status: 'accepted',
      createdAt: '2024-01-14 16:45',
      hourlyRate: 35,
      duration: '1 hour',
      location: 'Home'
    },
    {
      id: 4,
      type: 'session_reminder',
      parentName: 'Robert Wilson',
      parentEmail: 'robert.w@email.com',
      childName: 'Noah Wilson',
      subject: 'Calculus',
      sessionDate: '2024-01-16',
      sessionTime: '14:00 - 15:30',
      status: 'read',
      createdAt: '2024-01-15 08:00'
    },
    {
      id: 5,
      type: 'session_request',
      parentName: 'Lisa Martinez',
      parentEmail: 'lisa.m@email.com',
      parentContact: '(555) 567-8901',
      childName: 'James Martinez',
      childGrade: '11th Grade',
      subject: 'Computer Science',
      preferredDate: '2024-01-25',
      preferredTime: '17:00',
      message: 'James is learning Python programming and needs guidance on object-oriented programming concepts.',
      status: 'declined',
      createdAt: '2024-01-13 11:20',
      hourlyRate: 45,
      duration: '1.5 hours',
      location: 'Online'
    },
    {
      id: 6,
      type: 'rating_received',
      parentName: 'Sarah Johnson',
      rating: 5,
      review: 'Excellent tutor! My daughter\'s math grades improved significantly after just a few sessions.',
      sessionDate: '2024-01-10',
      status: 'unread',
      createdAt: '2024-01-15 09:30'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return notification.status === 'unread' || notification.status === 'pending';
    if (filter === 'session_requests') return notification.type === 'session_request';
    if (filter === 'accepted') return notification.status === 'accepted';
    return notification.status === filter;
  });

  const handleAcceptRequest = (requestId) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === requestId 
        ? { ...notif, status: 'accepted' }
        : notif
    ));
    setSelectedRequest(null);
    // Here you would typically send acceptance to backend
    alert('Session request accepted! The parent has been notified.');
  };

  const handleDeclineRequest = (requestId) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === requestId 
        ? { ...notif, status: 'declined' }
        : notif
    ));
    setSelectedRequest(null);
    // Here you would typically send decline to backend
    alert('Session request declined. The parent has been notified.');
  };

  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId && notif.status === 'unread'
        ? { ...notif, status: 'read' }
        : notif
    ));
  };

  const handleRespondToRequest = (requestId) => {
    if (!responseMessage.trim()) {
      alert('Please enter a message before responding.');
      return;
    }

    setNotifications(prev => prev.map(notif => 
      notif.id === requestId 
        ? { ...notif, status: 'responded', responseMessage }
        : notif
    ));
    setSelectedRequest(null);
    setResponseMessage('');
    // Here you would typically send response to backend
    alert('Response sent to parent!');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'session_request': return '📅';
      case 'session_reminder': return '⏰';
      case 'rating_received': return '⭐';
      case 'message': return '💬';
      default: return '🔔';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'accepted': return '#10b759';
      case 'declined': return '#ef4444';
      case 'responded': return '#3760e6';
      case 'unread': return '#8b5cf6';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending Response';
      case 'accepted': return 'Accepted';
      case 'declined': return 'Declined';
      case 'responded': return 'Responded';
      case 'unread': return 'New';
      default: return 'Read';
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return created.toLocaleDateString();
  };

  const pendingRequestsCount = notifications.filter(n => n.type === 'session_request' && n.status === 'pending').length;
  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <div className="tutor-notifications">
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1>Notifications</h1>
            <p>Manage session requests and stay updated</p>
          </div>
          <div className="notification-stats">
            <div className="stat">
              <span className="stat-number">{pendingRequestsCount}</span>
              <span className="stat-label">Pending Requests</span>
            </div>
            <div className="stat">
              <span className="stat-number">{unreadCount}</span>
              <span className="stat-label">Unread</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Notifications
          </button>
          <button 
            className={`filter-tab ${filter === 'session_requests' ? 'active' : ''}`}
            onClick={() => setFilter('session_requests')}
          >
            Session Requests
          </button>
          <button 
            className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread
          </button>
          <button 
            className={`filter-tab ${filter === 'accepted' ? 'active' : ''}`}
            onClick={() => setFilter('accepted')}
          >
            Accepted
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="no-notifications">
            <div className="empty-state">
              <div className="empty-icon">🔔</div>
              <h3>No notifications</h3>
              <p>You're all caught up! New session requests will appear here.</p>
            </div>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-card ${notification.status === 'unread' ? 'unread' : ''}`}
              onClick={() => {
                handleMarkAsRead(notification.id);
                if (notification.type === 'session_request') {
                  setSelectedRequest(notification);
                }
              }}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="notification-content">
                <div className="notification-header">
                  <h4>
                    {notification.type === 'session_request' && 'New Session Request'}
                    {notification.type === 'session_reminder' && 'Session Reminder'}
                    {notification.type === 'rating_received' && 'New Rating Received'}
                    {notification.type === 'message' && 'New Message'}
                  </h4>
                  <span className="time-ago">
                    {formatTimeAgo(notification.createdAt)}
                  </span>
                </div>

                <div className="notification-body">
                  {notification.type === 'session_request' && (
                    <div className="session-request-preview">
                      <p><strong>{notification.parentName}</strong> requested a session for <strong>{notification.childName}</strong></p>
                      <div className="request-details">
                        <span>Subject: {notification.subject}</span>
                        <span>Date: {new Date(notification.preferredDate).toLocaleDateString()}</span>
                        <span>Rate: ${notification.hourlyRate}/hr</span>
                      </div>
                    </div>
                  )}

                  {notification.type === 'session_reminder' && (
                    <p>Reminder: Session with {notification.childName} on {notification.sessionDate} at {notification.sessionTime}</p>
                  )}

                  {notification.type === 'rating_received' && (
                    <div className="rating-preview">
                      <div className="stars">
                        {'★'.repeat(notification.rating)}{'☆'.repeat(5 - notification.rating)}
                      </div>
                      <p>{notification.review}</p>
                    </div>
                  )}
                </div>

                <div className="notification-footer">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(notification.status) }}
                  >
                    {getStatusText(notification.status)}
                  </span>
                  {notification.type === 'session_request' && notification.status === 'pending' && (
                    <button 
                      className="quick-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRequest(notification);
                      }}
                    >
                      Respond
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Session Request Detail Modal */}
      {selectedRequest && selectedRequest.type === 'session_request' && (
        <div className="modal-overlay">
          <div className="request-modal">
            <div className="modal-header">
              <h2>Session Request Details</h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedRequest(null)}
              >
                ×
              </button>
            </div>

            <div className="request-details">
              <div className="parent-info">
                <h3>Parent Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Name:</span>
                    <span className="value">{selectedRequest.parentName}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Email:</span>
                    <span className="value">{selectedRequest.parentEmail}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Contact:</span>
                    <span className="value">{selectedRequest.parentContact}</span>
                  </div>
                </div>
              </div>

              <div className="student-info">
                <h3>Student Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Name:</span>
                    <span className="value">{selectedRequest.childName}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Grade:</span>
                    <span className="value">{selectedRequest.childGrade}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Subject:</span>
                    <span className="value">{selectedRequest.subject}</span>
                  </div>
                </div>
              </div>

              <div className="session-details">
                <h3>Session Details</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Preferred Date:</span>
                    <span className="value">{new Date(selectedRequest.preferredDate).toLocaleDateString()}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Preferred Time:</span>
                    <span className="value">{selectedRequest.preferredTime}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Duration:</span>
                    <span className="value">{selectedRequest.duration}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Location:</span>
                    <span className="value">{selectedRequest.location}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Hourly Rate:</span>
                    <span className="value">${selectedRequest.hourlyRate}/hr</span>
                  </div>
                </div>
              </div>

              <div className="parent-message">
                <h3>Parent's Message</h3>
                <div className="message-content">
                  <p>{selectedRequest.message}</p>
                </div>
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="response-section">
                  <h3>Your Response</h3>
                  <textarea
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    placeholder="Type your response to the parent here. You can suggest alternative times, ask for more information, or provide any other details."
                    rows="4"
                    className="response-textarea"
                  />
                  
                  <div className="action-buttons">
                    <button 
                      className="decline-btn"
                      onClick={() => handleDeclineRequest(selectedRequest.id)}
                    >
                      Decline Request
                    </button>
                    <button 
                      className="respond-btn"
                      onClick={() => handleRespondToRequest(selectedRequest.id)}
                      disabled={!responseMessage.trim()}
                    >
                      Send Response
                    </button>
                    <button 
                      className="accept-btn"
                      onClick={() => handleAcceptRequest(selectedRequest.id)}
                    >
                      Accept & Schedule
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionRequest;