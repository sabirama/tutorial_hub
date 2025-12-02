import { useState, useEffect } from 'react';
import "../../../../../assets/css/SessionRequest.css";
import apiCall from '../../../../../middlewares/api/axios';
import { getUserId, getToken } from '../../../../../middlewares/auth/auth';
import { useNavigate } from 'react-router-dom';
const SessionRequest = () => {
      const navigate = useNavigate();

    if(!sessionStorage.getItem("token")) {
       navigate('/');
    }
    
  const [sessionRequests, setSessionRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [view, setView] = useState('month');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(new Date());

  useEffect(() => {
    fetchSessionRequests();
  }, []);

  const fetchSessionRequests = async () => {
    try {
      const tutorId = getUserId();
      const token = getToken();
      const response = await apiCall({
        method: 'get',
        url: `/tutors/${tutorId}/session-requests`,
        headers: { token }
      });
      
      console.log('Session requests response:', response.data);
      
      if (response.data.success) {
        setSessionRequests(response.data.data || []);
      } else {
        console.error('Failed to fetch session requests:', response.data.error);
        setSessionRequests([]);
      }
    } catch (error) {
      console.error('Error fetching session requests:', error);
      console.error('Error details:', error.response?.data);
      setSessionRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced date matching function
  const isSameDate = (date1, date2) => {
    if (!date1 || !date2) return false;
    
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  // Generate calendar days for the current month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    const firstDayOfWeek = firstDay.getDay();
    
    // Add days from previous month
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ 
        date: prevDate, 
        isCurrentMonth: false, 
        requests: [] 
      });
    }
    
    const today = new Date();
    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      
      // Find requests for this date - handle different date formats
      const dateRequests = sessionRequests.filter(request => {
        if (!request.date && !request.preferred_date) return false;
        
        const requestDate = request.date || request.preferred_date;
        return isSameDate(requestDate, currentDate);
      });
      
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isToday: currentDate.toDateString() === today.toDateString(),
        requests: dateRequests
      });
    }
    
    // Add days from next month to complete the grid
    const totalCells = 42; // 6 weeks
    while (days.length < totalCells) {
      const nextDate = new Date(year, month + 1, days.length - daysInMonth - firstDayOfWeek + 1);
      days.push({ 
        date: nextDate, 
        isCurrentMonth: false, 
        requests: [] 
      });
    }
    
    return days;
  };

  // Get days for week view
  const getDaysInWeek = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      
      // Find requests for this date
      const dateRequests = sessionRequests.filter(request => {
        if (!request.date && !request.preferred_date) return false;
        
        const requestDate = request.date || request.preferred_date;
        return isSameDate(requestDate, currentDate);
      });
      
      const today = new Date();
      days.push({
        date: currentDate,
        isToday: currentDate.toDateString() === today.toDateString(),
        requests: dateRequests
      });
    }
    return days;
  };

  // Generate time slots for a day
  const generateTimeSlots = (date) => {
    const slots = [];
    const startHour = 8; // 8 AM
    const endHour = 22; // 10 PM
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) { // 30-minute intervals
        const time = new Date(date);
        time.setHours(hour, minute, 0, 0);
        
        // Find requests for this time slot
        const slotRequests = sessionRequests.filter(request => {
          if (!request.date && !request.preferred_date) return false;
          
          const requestDate = request.date || request.preferred_date;
          const requestTime = request.time || request.preferred_time;
          
          if (!isSameDate(requestDate, date)) return false;
          
          // Parse time - handle different time formats
          let requestHour, requestMinute;
          if (requestTime && typeof requestTime === 'string') {
            if (requestTime.includes(':')) {
              [requestHour, requestMinute] = requestTime.split(':').map(Number);
            } else {
              // Handle timestamp or other formats
              const timeDate = new Date(requestTime);
              requestHour = timeDate.getHours();
              requestMinute = timeDate.getMinutes();
            }
          } else {
            return false;
          }
          
          return requestHour === hour && requestMinute === minute;
        });
        
        slots.push({
          time,
          requests: slotRequests,
          isPast: time < new Date()
        });
      }
    }
    
    return slots;
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const token = getToken();
      const response = await apiCall({
        method: 'put',
        url: `/sessions/${requestId}`,
        data: { status: 'accepted' },
        headers: { token }
      });
      
      if (response.data.success) {
        setSessionRequests(prev => prev.map(req => 
          req.id === requestId ? { ...req, status: 'accepted' } : req
        ));
        setSelectedRequest(null);
        alert('Session request accepted! The parent has been notified.');
      } else {
        alert('Failed to accept request: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request. Please try again.');
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      const token = getToken();
      const response = await apiCall({
        method: 'put',
        url: `/sessions/${requestId}`,
        data: { status: 'declined' },
        headers: { token }
      });
      
      if (response.data.success) {
        setSessionRequests(prev => prev.map(req => 
          req.id === requestId ? { ...req, status: 'declined' } : req
        ));
        setSelectedRequest(null);
        alert('Session request declined. The parent has been notified.');
      } else {
        alert('Failed to decline request: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error declining request:', error);
      alert('Failed to decline request. Please try again.');
    }
  };

  const handleRespondToRequest = async (requestId) => {
    if (!responseMessage.trim()) {
      alert('Please enter a message before responding.');
      return;
    }

    try {
      const token = getToken();
      const response = await apiCall({
        method: 'put',
        url: `/sessions/${requestId}/respond`,
        data: { 
          response_message: responseMessage,
          status: 'responded'
        },
        headers: { token }
      });
      
      if (response.data.success) {
        setSessionRequests(prev => prev.map(req => 
          req.id === requestId ? { ...req, status: 'responded', response_message: responseMessage } : req
        ));
        setSelectedRequest(null);
        setResponseMessage('');
        alert('Response sent to parent!');
      } else {
        alert('Failed to send response: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error responding to request:', error);
      alert('Failed to send response. Please try again.');
    }
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  const navigateWeek = (direction) => {
    setCurrentWeek(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + (7 * direction)));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'accepted': return '#10b759';
      case 'declined': return '#ef4444';
      case 'responded': return '#3760e6';
      case 'completed': return '#10b759';
      case 'cancelled': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'accepted': return 'Accepted';
      case 'declined': return 'Declined';
      case 'responded': return 'Responded';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Time not specified';
    
    try {
      if (timeString.includes(':')) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
      } else {
        // Handle other time formats
        const timeDate = new Date(timeString);
        return timeDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      }
    } catch (error) {
      console.error('Error formatting time:', error, timeString);
      return 'Invalid time';
    }
  };

  // Helper function to get request display data
  const getRequestDisplayData = (request) => {
    return {
      id: request.id,
      subject: request.subject || request.subject_name || 'General',
      child_name: request.child_name || 'Student',
      parent_name: request.parent_name || 'Parent',
      parent_email: request.parent_email || 'No email',
      parent_contact: request.parent_contact || 'No contact',
      child_grade: request.child_grade || 'Not specified',
      date: request.date || request.preferred_date,
      time: request.time || request.preferred_time,
      duration: request.duration || '60',
      location: request.location || 'Online',
      hourly_rate: request.hourly_rate || '0',
      message: request.message || request.notes,
      status: request.status || 'pending',
      response_message: request.response_message
    };
  };

  const pendingRequestsCount = sessionRequests.filter(req => req.status === 'pending').length;

  if (loading) {
    return (
      <div className="session-requests-calendar">
        <div className="page-header">
          <h1>Session Requests</h1>
          <p>Loading session requests...</p>
        </div>
      </div>
    );
  }

  const days = getDaysInMonth(currentMonth);
  const weekDays = getDaysInWeek(currentWeek);
  const timeSlots = view === 'day' ? generateTimeSlots(selectedDate) : [];

  console.log('Session requests:', sessionRequests);
  console.log('Days in month:', days);
  console.log('Week days:', weekDays);

  return (
    <div className="session-requests-calendar">
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1>Session Requests Calendar</h1>
            <p>Manage and schedule session requests in calendar view</p>
          </div>
          <div className="request-stats">
            <div className="stat">
              <span className="stat-number">{pendingRequestsCount}</span>
              <span className="stat-label">Pending Requests</span>
            </div>
            <div className="stat">
              <span className="stat-number">{sessionRequests.length}</span>
              <span className="stat-label">Total Requests</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="calendar-controls">
        <div className="view-controls">
          <button className={`view-btn ${view === 'month' ? 'active' : ''}`} onClick={() => setView('month')}>Month</button>
          <button className={`view-btn ${view === 'week' ? 'active' : ''}`} onClick={() => setView('week')}>Week</button>
          <button className={`view-btn ${view === 'day' ? 'active' : ''}`} onClick={() => setView('day')}>Day</button>
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

      {/* Month View */}
      {view === 'month' && (
        <div className="month-view">
          <div className="calendar-header">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="calendar-day-header">{day}</div>
            ))}
          </div>
          <div className="calendar-grid">
            {days.map((day, index) => {
              const displayData = day.requests.map(getRequestDisplayData);
              return (
                <div key={index} className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''} ${displayData.length > 0 ? 'has-requests' : ''}`}
                  onClick={() => { setSelectedDate(day.date); if (day.isCurrentMonth) setView('day'); }}>
                  <div className="day-number">{day.date.getDate()}</div>
                  {displayData.length > 0 && (
                    <div className="day-requests">
                      {displayData.slice(0, 2).map(request => (
                        <div key={request.id} className="request-indicator" style={{ backgroundColor: getStatusColor(request.status) }}
                          onClick={(e) => { e.stopPropagation(); setSelectedRequest(request); }}>
                          {formatTime(request.time)}
                        </div>
                      ))}
                      {displayData.length > 2 && <div className="more-requests">+{displayData.length - 2} more</div>}
                    </div>
                  )}
                </div>
              );
            })}
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
            {weekDays.map((day, index) => {
              const displayData = day.requests.map(getRequestDisplayData);
              return (
                <div key={index} className={`week-day ${day.isToday ? 'today' : ''} ${displayData.length > 0 ? 'has-requests' : ''}`}
                  onClick={() => { setSelectedDate(day.date); setView('day'); }}>
                  <div className="week-requests">
                    {displayData.map(request => (
                      <div key={request.id} className="week-request-item" style={{ borderLeftColor: getStatusColor(request.status) }}
                        onClick={(e) => { e.stopPropagation(); setSelectedRequest(request); }}>
                        <div className="week-request-time">{formatTime(request.time)}</div>
                        <div className="week-request-subject">{request.subject}</div>
                        <div className="week-request-student">{request.child_name}</div>
                        <div className="week-request-status">{getStatusText(request.status)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
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
            {timeSlots.map((slot, index) => {
              const displayData = slot.requests.map(getRequestDisplayData);
              return (
                <div key={index} className={`time-slot ${slot.isPast ? 'past' : ''} ${displayData.length > 0 ? 'has-request' : ''}`}
                  onClick={() => { if (displayData.length > 0) setSelectedRequest(displayData[0]); setSelectedTimeSlot(slot); }}>
                  <div className="slot-time">
                    {slot.time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </div>
                  <div className="slot-requests">
                    {displayData.map(request => (
                      <div key={request.id} className="request-card-mini" style={{ borderLeftColor: getStatusColor(request.status) }}>
                        <div className="request-subject">{request.subject}</div>
                        <div className="request-student">{request.child_name}</div>
                        <div className="request-status">{getStatusText(request.status)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="modal-overlay">
          <div className="request-modal">
            <div className="modal-header">
              <h2>Session Request Details</h2>
              <button className="close-btn" onClick={() => setSelectedRequest(null)}>×</button>
            </div>
            <div className="request-details">
              <div className="parent-info">
                <h3>Parent Information</h3>
                <div className="info-grid">
                  <div className="info-item"><span>Name:</span> <span>{selectedRequest.parent_name}</span></div>
                  <div className="info-item"><span>Email:</span> <span>{selectedRequest.parent_email}</span></div>
                  <div className="info-item"><span>Contact:</span> <span>{selectedRequest.parent_contact}</span></div>
                </div>
              </div>
              <div className="student-info">
                <h3>Student Information</h3>
                <div className="info-grid">
                  <div className="info-item"><span>Name:</span> <span>{selectedRequest.child_name}</span></div>
                  <div className="info-item"><span>Grade:</span> <span>{selectedRequest.child_grade}</span></div>
                  <div className="info-item"><span>Subject:</span> <span>{selectedRequest.subject}</span></div>
                </div>
              </div>
              <div className="session-details">
                <h3>Session Details</h3>
                <div className="info-grid">
                  <div className="info-item"><span>Preferred Date:</span> <span>{selectedRequest.date ? new Date(selectedRequest.date).toLocaleDateString() : 'Not specified'}</span></div>
                  <div className="info-item"><span>Preferred Time:</span> <span>{formatTime(selectedRequest.time)}</span></div>
                  <div className="info-item"><span>Duration:</span> <span>{selectedRequest.duration} minutes</span></div>
                  <div className="info-item"><span>Location:</span> <span>{selectedRequest.location}</span></div>
                  <div className="info-item"><span>Hourly Rate:</span> <span>${selectedRequest.hourly_rate}/hr</span></div>
                </div>
              </div>
              {selectedRequest.message && (
                <div className="parent-message">
                  <h3>Parent's Message</h3>
                  <div className="message-content"><p>{selectedRequest.message}</p></div>
                </div>
              )}
              {selectedRequest.status === 'pending' && (
                <div className="response-section">
                  <h3>Your Response</h3>
                  <textarea value={responseMessage} onChange={(e) => setResponseMessage(e.target.value)} placeholder="Type your response to the parent here..." rows="4" className="response-textarea"/>
                  <div className="action-buttons">
                    <button className="decline-btn" onClick={() => handleDeclineRequest(selectedRequest.id)}>Decline Request</button>
                    <button className="respond-btn" onClick={() => handleRespondToRequest(selectedRequest.id)} disabled={!responseMessage.trim()}>Send Response</button>
                    <button className="accept-btn" onClick={() => handleAcceptRequest(selectedRequest.id)}>Accept & Schedule</button>
                  </div>
                </div>
              )}
              {selectedRequest.status !== 'pending' && (
                <div className="current-status">
                  <h3>Current Status</h3>
                  <div className="status-badge-large" style={{ backgroundColor: getStatusColor(selectedRequest.status) }}>
                    {getStatusText(selectedRequest.status)}
                  </div>
                  {selectedRequest.response_message && (
                    <div className="your-response">
                      <h4>Your Response:</h4>
                      <p>{selectedRequest.response_message}</p>
                    </div>
                  )}
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