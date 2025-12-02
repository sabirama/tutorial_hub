import { useState, useEffect } from 'react';
import "../../../../../assets/css/AdminDashboard.css";
import apiCall from '../../../../../middlewares/api/axios';
import { getToken } from '../../../../../middlewares/auth/auth';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalParents: 0,
    totalTutors: 0,
    newRegistrations: 0
  });

  const [tutorsBySubject, setTutorsBySubject] = useState([]);
  const [recentParents, setRecentParents] = useState([]);
  const [recentTutors, setRecentTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all parents
      const parentsResponse = await apiCall({
        method: 'get',
        url: '/parents',
        headers: { token: getToken() }
      });
      
      let parents = [];
      
      // Handle different response structures
      if (Array.isArray(parentsResponse.data)) {
        parents = parentsResponse.data;
      } else if (parentsResponse.data?.data && Array.isArray(parentsResponse.data.data)) {
        parents = parentsResponse.data.data;
      } else if (parentsResponse.data?.parents && Array.isArray(parentsResponse.data.parents)) {
        parents = parentsResponse.data.parents;
      } else if (parentsResponse.data?.users && Array.isArray(parentsResponse.data.users)) {
        parents = parentsResponse.data.users;
      }
      
      // Fetch all tutors
      const tutorsResponse = await apiCall({
        method: 'get',
        url: '/tutors',
        headers: { token: getToken() }
      });
      
      let tutors = [];
      
      // Handle different response structures for tutors
      if (Array.isArray(tutorsResponse.data)) {
        tutors = tutorsResponse.data;
      } else if (tutorsResponse.data?.data && Array.isArray(tutorsResponse.data.data)) {
        tutors = tutorsResponse.data.data;
      } else if (tutorsResponse.data?.tutors && Array.isArray(tutorsResponse.data.tutors)) {
        tutors = tutorsResponse.data.tutors;
      } else if (tutorsResponse.data?.users && Array.isArray(tutorsResponse.data.users)) {
        tutors = tutorsResponse.data.users;
      }

      // Calculate stats
      const totalParents = parents.length;
      const totalTutors = tutors.length;
      
      // Calculate new registrations (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const newParents = parents.filter(p => {
        const createdDate = p.created_at ? new Date(p.created_at) : 
                           p.createdAt ? new Date(p.createdAt) : 
                           p.joinDate ? new Date(p.joinDate) : 
                           p.created ? new Date(p.created) : 
                           new Date();
        return createdDate > oneWeekAgo;
      }).length;
      
      const newTutors = tutors.filter(t => {
        const createdDate = t.created_at ? new Date(t.created_at) : 
                           t.createdAt ? new Date(t.createdAt) : 
                           t.joinDate ? new Date(t.joinDate) : 
                           t.created ? new Date(t.created) : 
                           new Date();
        return createdDate > oneWeekAgo;
      }).length;
      
      const newRegistrations = newParents + newTutors;

      setStats({
        totalParents,
        totalTutors,
        newRegistrations
      });

      // Process tutors by subject (from course field)
      const subjectMap = {};
      tutors.forEach(tutor => {
        const courses = tutor.course ? [tutor.course] : [];
        courses.forEach(course => {
          if (course && course.trim()) {
            const subject = course.trim();
            subjectMap[subject] = (subjectMap[subject] || 0) + 1;
          }
        });
      });
      
      const tutorsBySubjectArray = Object.entries(subjectMap).map(([subject, count]) => ({
        subject,
        count
      })).sort((a, b) => b.count - a.count);
      
      setTutorsBySubject(tutorsBySubjectArray);

      // Get recent parents (last 5)
      const recentParentsArray = parents
        .sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at) : 
                       a.createdAt ? new Date(a.createdAt) : 
                       a.joinDate ? new Date(a.joinDate) : 
                       a.created ? new Date(a.created) : 
                       new Date(0);
          const dateB = b.created_at ? new Date(b.created_at) : 
                       b.createdAt ? new Date(b.createdAt) : 
                       b.joinDate ? new Date(b.joinDate) : 
                       b.created ? new Date(b.created) : 
                       new Date(0);
          return dateB - dateA;
        })
        .slice(0, 5)
        .map(parent => ({
          id: parent.id,
          name: parent.full_name || parent.name || parent.parent_name || 'Unknown Parent',
          joinDate: parent.created_at || parent.createdAt || parent.joinDate || parent.created || new Date().toISOString(),
          children: parent.children_count || parent.children || 0,
          status: parent.status || 'active',
          email: parent.email,
          location: parent.location
        }));
      
      setRecentParents(recentParentsArray);

      // Get recent tutors (last 5)
      const recentTutorsArray = tutors
        .sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at) : 
                       a.createdAt ? new Date(a.createdAt) : 
                       a.joinDate ? new Date(a.joinDate) : 
                       a.created ? new Date(a.created) : 
                       new Date(0);
          const dateB = b.created_at ? new Date(b.created_at) : 
                       b.createdAt ? new Date(b.createdAt) : 
                       b.joinDate ? new Date(b.joinDate) : 
                       b.created ? new Date(b.created) : 
                       new Date(0);
          return dateB - dateA;
        })
        .slice(0, 5)
        .map(tutor => ({
          id: tutor.id,
          name: tutor.full_name || tutor.name || tutor.tutor_name || 'Unknown Tutor',
          joinDate: tutor.created_at || tutor.createdAt || tutor.joinDate || tutor.created || new Date().toISOString(),
          course: tutor.course || 'Not specified',
          rating: parseFloat(tutor.rating) || 0,
          hourly_rate: parseFloat(tutor.hourly_rate) || 0,
          status: tutor.status || 'active',
          email: tutor.email,
          location: tutor.location,
          verified: tutor.verified || false
        }));
      
      setRecentTutors(recentTutorsArray);

      setLoading(false);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  // Handle status updates using PUT - DEBUGGED VERSION
  const handleUpdateUserStatus = async (userId, userType, newStatus) => {
    try {
      console.log(`Updating ${userType} ${userId} status to:`, newStatus);
      
      const response = await apiCall({
        method: 'put',
        url: `/${userType}/${userId}`,
        data: { status: newStatus },
        headers: { token: getToken() }
      });

      console.log('Status update response:', response);

      // Update local state
      if (userType === 'parents') {
        setRecentParents(prev =>
          prev.map(user =>
            user.id === userId ? { ...user, status: newStatus } : user
          )
        );
      } else if (userType === 'tutors') {
        setRecentTutors(prev =>
          prev.map(user =>
            user.id === userId ? { ...user, status: newStatus } : user
          )
        );
      }

      alert('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      console.error('Error response:', error.response);
      alert('Failed to update status: ' + (error?.data?.error || error.message));
    }
  };

  // Handle verification toggle - DEBUGGED VERSION
  const handleToggleVerification = async (tutorId, currentVerified) => {
    try {
      console.log(`Toggling verification for tutor ${tutorId}. Current:`, currentVerified);
      
      const newVerified = !currentVerified;
      const dataToSend = { 
        verified: newVerified,
        status: 'active'  // Keep status same when updating verification
      };
      
      console.log('Sending data:', dataToSend);
      
      const response = await apiCall({
        method: 'put',
        url: `/tutors/${tutorId}`,
        data: dataToSend,
        headers: { token: getToken() }
      });

      console.log('Verification update response:', response);

      // Update local state
      setRecentTutors(prev =>
        prev.map(tutor =>
          tutor.id === tutorId ? { ...tutor, verified: newVerified } : tutor
        )
      );

      alert(`Tutor ${newVerified ? 'verified' : 'unverified'} successfully`);
    } catch (error) {
      console.error('Error toggling verification:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error message:', error.message);
      alert('Failed to update verification status: ' + (error.response?.data?.error || error.message || 'Unknown error'));
    }
  };

  const mainStats = [
    { 
      title: 'Total Parents', 
      value: loading ? '...' : stats.totalParents, 
      change: '+12%', 
      icon: '👨‍👩‍👧‍👦',
      color: '#3760e6'
    },
    { 
      title: 'Total Tutors', 
      value: loading ? '...' : stats.totalTutors, 
      change: '+8%', 
      icon: '👨‍🏫',
      color: '#10b759'
    },
    { 
      title: 'New Registrations', 
      value: loading ? '...' : stats.newRegistrations, 
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

  // Loading skeletons
  const StatSkeleton = () => (
    <div className="stat-card skeleton">
      <div className="stat-icon skeleton-shimmer"></div>
      <div className="stat-content">
        <h3 className="skeleton-text">---</h3>
        <p className="skeleton-text">Loading...</p>
        <span className="stat-change skeleton-text">+0%</span>
      </div>
    </div>
  );

  const TableRowSkeleton = () => (
    <tr className="skeleton-row">
      <td><div className="skeleton-text"></div></td>
      <td><div className="skeleton-text"></div></td>
      <td><div className="skeleton-text"></div></td>
      <td><div className="skeleton-text"></div></td>
      <td><div className="skeleton-text"></div></td>
    </tr>
  );

  const SubjectItemSkeleton = () => (
    <div className="subject-item skeleton">
      <div className="subject-info">
        <span className="subject-name skeleton-text">Loading...</span>
        <span className="tutor-count skeleton-text">0 tutors</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill skeleton-shimmer"></div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-state">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Overview of platform statistics and activities</p>
        <button onClick={fetchDashboardData} className="refresh-btn">
          ↻ Refresh
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="stats-grid">
        {loading ? (
          Array(3).fill(0).map((_, index) => <StatSkeleton key={index} />)
        ) : (
          mainStats.map((stat, index) => (
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
          ))
        )}
      </div>

      <div className="dashboard-display">
        {/* Left Column */}
        <div className="content-left">
          {/* Tutors by Subject (based on course) */}
          <div className="chart-card">
            <h3>Tutors by Course/Subject</h3>
            <div className="subjects-list">
              {loading ? (
                Array(5).fill(0).map((_, index) => <SubjectItemSkeleton key={index} />)
              ) : tutorsBySubject.length > 0 ? (
                tutorsBySubject.map((subject, index) => (
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
                ))
              ) : (
                <div className="no-data">No course data available</div>
              )}
            </div>
          </div>

          {/* Recent Parents */}
          <div className="table-card">
            <div className="table-header">
              <h3>Recent Parents</h3>
              <span className="table-count">
                {!loading && `(${recentParents.length})`}
              </span>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Join Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array(5).fill(0).map((_, index) => <TableRowSkeleton key={index} />)
                  ) : recentParents.length > 0 ? (
                    recentParents.map(parent => (
                      <tr key={parent.id} className={parent.status === 'inactive' ? 'inactive-row' : ''}>
                        <td className="user-name">
                          <div className="name-avatar">
                            <div className="avatar-sm" style={{ 
                              backgroundColor: parent.status === 'inactive' ? '#6c757d' : '#3760e6'
                            }}>
                              {parent.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div>{parent.name}</div>
                              <div className="location-cell">{parent.location || 'Not specified'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="email-cell">{parent.email || 'No email'}</td>
                        <td>{new Date(parent.joinDate).toLocaleDateString()}</td>
                        <td>
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(parent.status) }}
                          >
                            {parent.status}
                          </span>
                        </td>
                        <td>
                          <select
                            value={parent.status}
                            onChange={(e) => handleUpdateUserStatus(parent.id, 'parents', e.target.value)}
                            className="status-select"
                            style={{ 
                              backgroundColor: getStatusColor(parent.status),
                              color: 'white',
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              minWidth: '100px'
                            }}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-data">No parent data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="content-right">
          {/* Recent Tutors */}
          <div className="table-card">
            <div className="table-header">
              <h3>Recent Tutors</h3>
              <span className="table-count">
                {!loading && `(${recentTutors.length})`}
              </span>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Course</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array(5).fill(0).map((_, index) => <TableRowSkeleton key={index} />)
                  ) : recentTutors.length > 0 ? (
                    recentTutors.map(tutor => (
                      <tr key={tutor.id} className={tutor.status === 'inactive' ? 'inactive-row' : ''}>
                        <td className="user-name">
                          <div className="name-avatar">
                            <div className="avatar-sm" style={{ 
                              backgroundColor: tutor.status === 'inactive' ? '#6c757d' : '#3760e6'
                            }}>
                              {tutor.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div>{tutor.name}</div>
                              <div className="email-cell">{tutor.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>{tutor.course}</td>
                        <td>
                          <div className="rating-small">
                            ⭐ {tutor.rating.toFixed(1)}
                            {tutor.hourly_rate > 0 && (
                              <div className="hourly-rate">₱{tutor.hourly_rate}/hr</div>
                            )}
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
                        <td>
                          <div className="action-buttons">
                            <select
                              value={tutor.status}
                              onChange={(e) => handleUpdateUserStatus(tutor.id, 'tutors', e.target.value)}
                              className="status-select"
                              style={{ 
                                backgroundColor: getStatusColor(tutor.status),
                                color: 'white',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                marginBottom: '4px',
                                minWidth: '100px'
                              }}
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                              <option value="pending">Pending</option>
                            </select>
                            <button
                              onClick={() => handleToggleVerification(tutor.id, tutor.verified)}
                              className={`verify-btn ${tutor.verified ? 'verified' : 'unverified'}`}
                            >
                              {tutor.verified ? '✅ Verified' : '❌ Verify'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-data">No tutor data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;