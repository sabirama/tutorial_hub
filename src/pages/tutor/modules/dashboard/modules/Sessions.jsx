import { useState, useEffect } from 'react';
import "../../../../../assets/css/Sessions.css"
import apiCall from '../../../../../middlewares/api/axios';
import { getUserId } from '../../../../../middlewares/auth/auth';
import { useNavigate } from 'react-router-dom';

const Sessions = () => {
      const navigate = useNavigate();

    if(!sessionStorage.getItem("token")) {
       navigate('/');
    }
    

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [view, setView] = useState('month');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await apiCall({
        method: 'get',
        url: `/sessions?tutor_id=${getUserId()}`,
      });
      setSessions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  // Get days for month view
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    const firstDayOfWeek = firstDay.getDay();
    
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false, sessions: [] });
    }
    
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dateSessions = sessions.filter(session => 
        new Date(session.date).toDateString() === currentDate.toDateString()
      );
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isToday: currentDate.toDateString() === today.toDateString(),
        sessions: dateSessions
      });
    }
    
    const totalCells = 42;
    while (days.length < totalCells) {
      const nextDate = new Date(year, month + 1, days.length - daysInMonth - firstDayOfWeek + 1);
      days.push({ date: nextDate, isCurrentMonth: false, sessions: [] });
    }
    
    return days;
  };

  // Get days for week view - FIXED
  const getDaysInWeek = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      
      const dateSessions = sessions.filter(session => 
        new Date(session.date).toDateString() === currentDate.toDateString()
      );
      
      const today = new Date();
      days.push({
        date: currentDate,
        isToday: currentDate.toDateString() === today.toDateString(),
        sessions: dateSessions
      });
    }
    return days;
  };

  // Generate time slots for day view
  const generateTimeSlots = (date) => {
    const slots = [];
    for (let hour = 7; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = new Date(date);
        time.setHours(hour, minute, 0, 0);
        
        const slotSessions = sessions.filter(session => {
          const sessionTime = new Date(session.date + ' ' + session.time);
          return sessionTime.getHours() === hour && 
                 sessionTime.getMinutes() === minute &&
                 new Date(session.date).toDateString() === date.toDateString();
        });
        
        slots.push({
          time,
          sessions: slotSessions,
          isPast: time < new Date()
        });
      }
    }
    return slots;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  const navigateWeek = (direction) => {
    setCurrentWeek(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + (7 * direction)));
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

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

  const days = getDaysInMonth(currentMonth);
  const weekDays = getDaysInWeek(currentWeek);
  const timeSlots = view === 'day' ? generateTimeSlots(selectedDate) : [];
  const filteredSessions = sessions.filter(session =>
    statusFilter === 'all' || session?.status === statusFilter
  );

  if (loading) {
    return (
      <div className="sessions-page">
        <div className="sessions-header">
          <h1>My Tutoring Sessions</h1>
          <p>Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sessions-page">
      <div className="sessions-header">
        <div className="header-content">
          <div>
            <h1>My Tutoring Sessions</h1>
            <p>View and manage your scheduled tutoring sessions</p>
          </div>
          <div className="session-stats">
            <div className="stat">
              <span className="stat-number">{sessions.length}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat">
              <span className="stat-number">{sessions.filter(s => s.status === 'upcoming').length}</span>
              <span className="stat-label">Upcoming</span>
            </div>
          </div>
        </div>
      </div>

      <div className="calendar-controls">
        <div className="view-controls">
          <button className={`view-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>List</button>
          <button className={`view-btn ${view === 'month' ? 'active' : ''}`} onClick={() => setView('month')}>Month</button>
          <button className={`view-btn ${view === 'week' ? 'active' : ''}`} onClick={() => setView('week')}>Week</button>
          <button className={`view-btn ${view === 'day' ? 'active' : ''}`} onClick={() => setView('day')}>Day</button>
        </div>

        <div className="filter-controls">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="status-filter">
            <option value="all">All Sessions</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {view === 'month' && (
          <div className="month-navigation">
            <button onClick={() => navigateMonth(-1)}>‹</button>
            <h2>{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
            <button onClick={() => navigateMonth(1)}>›</button>
          </div>
        )}

        {view === 'week' && (
          <div className="week-navigation">
            <button onClick={() => navigateWeek(-1)}>‹</button>
            <h2>
              {weekDays[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
              {weekDays[6].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </h2>
            <button onClick={() => navigateWeek(1)}>›</button>
          </div>
        )}

        <button className="today-btn" onClick={() => {
          setCurrentMonth(new Date());
          setCurrentWeek(new Date());
          setSelectedDate(new Date());
        }}>Today</button>
      </div>

      {/* List View */}
      {view === 'list' && (
        <div className="sessions-grid">
          {filteredSessions.length === 0 ? (
            <div className="no-sessions"><p>No sessions found</p></div>
          ) : (
            filteredSessions.map(session => (
              <div key={session.id} className="session-card">
                <div className="session-header">
                  <h3>{session.subject_name}</h3>
                  <span className="session-status" style={{ backgroundColor: getStatusColor(session.status) }}>
                    {session.status}
                  </span>
                </div>
                <div className="session-date-time">
                  <div className="date"><strong>📅 {formatDate(session.date)}</strong></div>
                  <div className="time"><strong>⏰ {formatTime(session.time)}</strong></div>
                </div>
                <div className="session-participants">
                  <div className="participant"><span>Student:</span> <span>{session.child_name}</span></div>
                  <div className="participant"><span>Parent:</span> <span>{session.parent_name}</span></div>
                </div>
                <div className="session-actions">
                  <button className="btn-primary" onClick={() => setSelectedSession(session)}>View Details</button>
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
      )}

      {/* Month View */}
      {view === 'month' && (
        <div className="month-view">
          <div className="calendar-header">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="calendar-day-header">{day}</div>
            ))}
          </div>
          <div className="calendar-grid">
            {days.map((day, index) => (
              <div key={index} className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''} ${day.sessions.length > 0 ? 'has-sessions' : ''}`}
                onClick={() => { setSelectedDate(day.date); if (day.isCurrentMonth) setView('day'); }}>
                <div className="day-number">{day.date.getDate()}</div>
                {day.sessions.length > 0 && (
                  <div className="day-sessions">
                    {day.sessions.slice(0, 2).map(session => (
                      <div key={session.id} className="session-indicator" style={{ backgroundColor: getStatusColor(session.status) }}
                        onClick={(e) => { e.stopPropagation(); setSelectedSession(session); }}>
                        <span className="session-time">{formatTime(session.time)}</span>
                        <span className="session-subject">{session.subject_name}</span>
                      </div>
                    ))}
                    {day.sessions.length > 2 && <div className="more-sessions">+{day.sessions.length - 2} more</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Week View */}
      {view === 'week' && (
        <div className="week-view">
          <div className="week-header">
            {weekDays.map((day, index) => (
              <div key={index} className={`week-day-header ${day.isToday ? 'today' : ''}`}>
                <div className="week-day-name">{day.date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div className="week-day-date">{day.date.getDate()}</div>
              </div>
            ))}
          </div>
          <div className="week-grid">
            {weekDays.map((day, index) => (
              <div key={index} className={`week-day ${day.isToday ? 'today' : ''} ${day.sessions.length > 0 ? 'has-sessions' : ''}`}
                onClick={() => { setSelectedDate(day.date); setView('day'); }}>
                <div className="week-sessions">
                  {day.sessions.map(session => (
                    <div key={session.id} className="week-session-item" style={{ borderLeftColor: getStatusColor(session.status) }}
                      onClick={(e) => { e.stopPropagation(); setSelectedSession(session); }}>
                      <div className="week-session-time">{formatTime(session.time)}</div>
                      <div className="week-session-subject">{session.subject_name}</div>
                      <div className="week-session-student">{session.child_name}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day View */}
      {view === 'day' && (
        <div className="day-view">
          <div className="day-header">
            <h3>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h3>
            <button className="back-btn" onClick={() => setView('week')}>← Back to Week</button>
          </div>
          <div className="time-slots">
            {timeSlots.map((slot, index) => (
              <div key={index} className={`time-slot ${slot.isPast ? 'past' : ''} ${slot.sessions.length > 0 ? 'has-session' : ''}`}
                onClick={() => { if (slot.sessions.length > 0) setSelectedSession(slot.sessions[0]); }}>
                <div className="slot-time">
                  {slot.time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </div>
                <div className="slot-sessions">
                  {slot.sessions.map(session => (
                    <div key={session.id} className="session-card-mini" style={{ borderLeftColor: getStatusColor(session.status) }}>
                      <div className="session-subject-mini">{session.subject_name}</div>
                      <div className="session-student">{session.child_name}</div>
                      <div className="session-status-mini" style={{ color: getStatusColor(session.status) }}>{session.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="modal-overlay">
          <div className="session-modal">
            <div className="modal-header">
              <h2>Session Details</h2>
              <button className="close-btn" onClick={() => setSelectedSession(null)}>×</button>
            </div>
            <div className="session-details">
              <div className="detail-section">
                <h3>{selectedSession.subject_name}</h3>
                <div className="session-status-badge" style={{ backgroundColor: getStatusColor(selectedSession.status) }}>
                  {selectedSession.status}
                </div>
              </div>
              <div className="detail-grid">
                <div className="detail-item"><span>Date:</span> <span>{formatDate(selectedSession.date)}</span></div>
                <div className="detail-item"><span>Time:</span> <span>{formatTime(selectedSession.time)}</span></div>
                <div className="detail-item"><span>Duration:</span> <span>{selectedSession.duration}</span></div>
                <div className="detail-item"><span>Location:</span> <span>{selectedSession.location}</span></div>
              </div>
              <div className="participants-section">
                <h4>Participants</h4>
                <div className="participant-detail"><span>Student:</span> <span>{selectedSession.child_name}</span></div>
                <div className="participant-detail"><span>Parent:</span> <span>{selectedSession.parent_name}</span></div>
              </div>
              <div className="session-actions-modal">
                <button className="btn-close" onClick={() => setSelectedSession(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sessions;