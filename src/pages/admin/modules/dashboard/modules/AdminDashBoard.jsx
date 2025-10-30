import { useState } from 'react';
import "../../../../../assets/css/AdminDashboard.css"

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalParents: 156,
    totalTutors: 89,
    totalSessions: 543,
    activeSessions: 23,
    revenue: 12540,
    newRegistrations: 12
  });

  const [tutorsBySubject, setTutorsBySubject] = useState([
    { subject: 'Mathematics', count: 28 },
    { subject: 'Physics', count: 15 },
    { subject: 'Chemistry', count: 12 },
    { subject: 'Biology', count: 10 },
    { subject: 'English', count: 18 },
    { subject: 'Computer Science', count: 22 },
    { subject: 'History', count: 8 },
    { subject: 'Spanish', count: 6 }
  ]);

  const [recentParents, setRecentParents] = useState([
    { id: 1, name: 'Sarah Johnson', joinDate: '2024-01-15', children: 2, status: 'active' },
    { id: 2, name: 'Michael Chen', joinDate: '2024-01-14', children: 1, status: 'active' },
    { id: 3, name: 'Emily Davis', joinDate: '2024-01-13', children: 3, status: 'active' },
    { id: 4, name: 'Robert Wilson', joinDate: '2024-01-12', children: 2, status: 'inactive' },
    { id: 5, name: 'Lisa Martinez', joinDate: '2024-01-11', children: 1, status: 'active' }
  ]);

  const [recentTutors, setRecentTutors] = useState([
    { id: 1, name: 'John Smith', joinDate: '2024-01-15', subjects: ['Math', 'Physics'], rating: 4.8, status: 'active' },
    { id: 2, name: 'Maria Garcia', joinDate: '2024-01-14', subjects: ['Chemistry', 'Biology'], rating: 4.9, status: 'active' },
    { id: 3, name: 'David Kim', joinDate: '2024-01-13', subjects: ['Computer Science'], rating: 4.7, status: 'pending' },
    { id: 4, name: 'Sarah Williams', joinDate: '2024-01-12', subjects: ['English', 'History'], rating: 4.5, status: 'active' },
    { id: 5, name: 'James Brown', joinDate: '2024-01-11', subjects: ['Mathematics'], rating: 4.6, status: 'inactive' }
  ]);

  const [sessionStats, setSessionStats] = useState([
    { day: 'Mon', sessions: 45 },
    { day: 'Tue', sessions: 52 },
    { day: 'Wed', sessions: 48 },
    { day: 'Thu', sessions: 61 },
    { day: 'Fri', sessions: 55 },
    { day: 'Sat', sessions: 38 },
    { day: 'Sun', sessions: 25 }
  ]);

  const mainStats = [
    { 
      title: 'Total Parents', 
      value: stats.totalParents, 
      change: '+12%', 
      icon: '👨‍👩‍👧‍👦',
      color: '#3760e6'
    },
    { 
      title: 'Total Tutors', 
      value: stats.totalTutors, 
      change: '+8%', 
      icon: '👨‍🏫',
      color: '#10b759'
    },
    { 
      title: 'Total Sessions', 
      value: stats.totalSessions, 
      change: '+15%', 
      icon: '📚',
      color: '#f59e0b'
    },
    { 
      title: 'Active Sessions', 
      value: stats.activeSessions, 
      change: '+5', 
      icon: '🟢',
      color: '#ef4444'
    },
    { 
      title: 'Revenue', 
      value: `$${stats.revenue.toLocaleString()}`, 
      change: '+18%', 
      icon: '💰',
      color: '#8b5cf6'
    },
    { 
      title: 'New Registrations', 
      value: stats.newRegistrations, 
      change: '+3', 
      icon: '📈',
      color: '#06b6d4'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b759';
      case 'inactive': return '#6c757d';
      case 'pending': return '#f59e0b';
      default: return '#6c757d';
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Overview of platform statistics and activities</p>
      </div>

      {/* Main Stats Grid */}
      <div className="stats-grid">
        {mainStats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
              <span className="stat-change positive">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-display">
        {/* Left Column */}
        <div className="content-left">
          {/* Tutors by Subject */}
          <div className="chart-card">
            <h3>Tutors by Subject</h3>
            <div className="subjects-list">
              {tutorsBySubject.map((subject, index) => (
                <div key={index} className="subject-item">
                  <div className="subject-info">
                    <span className="subject-name">{subject.subject}</span>
                    <span className="tutor-count">{subject.count} tutors</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${(subject.count / Math.max(...tutorsBySubject.map(s => s.count))) * 80}%`,
                        backgroundColor: '#3760e6'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Parents */}
          <div className="table-card">
            <h3>Recent Parents</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Join Date</th>
                    <th>Children</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentParents.map(parent => (
                    <tr key={parent.id}>
                      <td className="user-name">
                        <div className="name-avatar">
                          <div className="avatar-sm">
                            {parent.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          {parent.name}
                        </div>
                      </td>
                      <td>{new Date(parent.joinDate).toLocaleDateString()}</td>
                      <td>{parent.children}</td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(parent.status) }}
                        >
                          {parent.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="content-right">
          {/* Recent Tutors */}
          <div className="table-card">
            <h3>Recent Tutors</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Subjects</th>
                    <th>Rating</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTutors.map(tutor => (
                    <tr key={tutor.id}>
                      <td className="user-name">
                        <div className="name-avatar">
                          <div className="avatar-sm">
                            {tutor.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          {tutor.name}
                        </div>
                      </td>
                      <td>
                        <div className="subjects-tags">
                          {tutor.subjects.map((subject, idx) => (
                            <span key={idx} className="subject-tag-sm">
                              {subject}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div className="rating-small">
                          ⭐ {tutor.rating}
                        </div>
                      </td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(tutor.status) }}
                        >
                          {tutor.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Weekly Sessions Chart */}
          <div className="chart-card">
            <h3>Weekly Sessions</h3>
            <div className="sessions-chart">
              {sessionStats.map((day, index) => (
                <div key={index} className="chart-bar">
                  <div className="bar-container">
                    <div 
                      className="bar-fill"
                      style={{ height: `${(day.sessions / 70) * 100}%` }}
                    ></div>
                  </div>
                  <span className="bar-label">{day.day}</span>
                  <span className="bar-value">{day.sessions}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;