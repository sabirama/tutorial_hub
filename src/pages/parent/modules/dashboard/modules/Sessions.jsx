import React, { useState } from 'react';
import "../../../../../assets/css/Sessions.css"

const Sessions = () => {
  const [sessions, setSessions] = useState([
    {
      id: 1,
      date: "2024-01-15",
      time: "14:00 - 15:30",
      subject: "Mathematics",
      tutor: "John Smith",
      status: "upcoming",
      duration: "1.5 hours",
      location: "Online",
      notes: "Algebra basics"
    },
    {
      id: 2,
      date: "2024-01-10",
      time: "10:00 - 11:00",
      subject: "Physics",
      tutor: "Maria Garcia",
      status: "completed",
      duration: "1 hour",
      location: "Library",
      notes: "Newton's Laws"
    },
    {
      id: 3,
      date: "2024-01-18",
      time: "16:00 - 17:30",
      subject: "Computer Science",
      tutor: "David Kim",
      status: "upcoming",
      duration: "1.5 hours",
      location: "Student Center",
      notes: "Python programming"
    },
    {
      id: 4,
      date: "2024-01-05",
      time: "13:00 - 14:00",
      subject: "Chemistry",
      tutor: "Sarah Williams",
      status: "completed",
      duration: "1 hour",
      location: "Online",
      notes: "Organic chemistry"
    },
    {
      id: 5,
      date: "2024-01-20",
      time: "09:00 - 10:30",
      subject: "Biology",
      tutor: "James Brown",
      status: "upcoming",
      duration: "1.5 hours",
      location: "Home",
      notes: "Cell biology"
    }
  ]);

  const [statusFilter, setStatusFilter] = useState('all');

  const filteredSessions = sessions.filter(session => 
    statusFilter === 'all' || session.status === statusFilter
  );

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return '#3760e6';
      case 'completed': return '#10b759';
      case 'cancelled': return '#ef4444';
      default: return '#666';
    }
  };

  return (
    <div className="sessions-page">
      <div className="sessions-header">
        <h1>My Sessions</h1>
        <p>View and manage your tutoring sessions</p>
      </div>

      <div className="sessions-controls">
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="status-filter"
        >
          <option value="all">All Sessions</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="sessions-grid">
        {filteredSessions.length === 0 ? (
          <div className="no-sessions">
            <p>No sessions found matching your criteria.</p>
          </div>
        ) : (
          filteredSessions.map(session => (
            <div key={session.id} className="session-card">
              <div className="session-header">
                <h3 className="session-subject">{session.subject}</h3>
                <span 
                  className="session-status"
                  style={{ backgroundColor: getStatusColor(session.status) }}
                >
                  {session.status}
                </span>
              </div>

              <div className="session-date-time">
                <div className="date">
                  <strong>📅 {formatDate(session.date)}</strong>
                </div>
                <div className="time">
                  <strong>⏰ {session.time}</strong>
                </div>
              </div>

              <div className="session-duration-location">
                <span className="duration">⏱️ {session.duration}</span>
                <span className="location">📍 {session.location}</span>
              </div>

              <div className="session-participants">
                <div className="participant">
                  <span className="label">Tutor:</span>
                  <span className="name">{session.tutor}</span>
                </div>
              </div>

              {session.notes && (
                <div className="session-notes">
                  <span className="label">Notes:</span>
                  <p>{session.notes}</p>
                </div>
              )}

              <div className="session-actions">
                <button className="btn-primary">View Details</button>
                {session.status === 'upcoming' && (
                  <>
                    <button className="btn-secondary">Reschedule</button>
                    <button className="btn-cancel">Cancel</button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sessions;