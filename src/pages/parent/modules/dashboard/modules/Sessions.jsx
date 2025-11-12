import React, { useState, useEffect } from 'react';
import "../../../../../assets/css/Sessions.css"
import apiCall from '../../../../../middlewares/api/axios';
import { getUserId } from '../../../../../middlewares/auth/auth';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  useEffect(() => {
    async function fetchSessions() {
      try {
        const response = await apiCall({
          method: 'get',
          url: `/sessions?parent_id=${getUserId()}`,
        });
        setSessions(response.data.data || []);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, []);

  const filteredSessions = sessions.filter(session =>
    statusFilter === 'all' || session?.status === statusFilter
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

  if (loading) {
    return (
      <div className="sessions-page">
        <div className="sessions-header">
          <h1>My Sessions</h1>
          <p>Loading sessions...</p>
        </div>
      </div>
    );
  }

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
                <h3 className="session-subject">{session.subject_name}</h3>
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
                  <span className="name">{session.tutor_name}</span>
                </div>
                <div className="participant">
                   <span className="label">Child:</span>
                  <span className="name">{session.child_name}</span>
                </div>
              </div>

              {session.notes && (
                <div className="session-notes">
                  <span className="label">Notes:</span>
                  <p>{session.notes}</p>
                </div>
              )}

              <div className="session-actions">
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