import React, { useEffect } from 'react';
import '../../assets/css/Logout.css';

const Logout = () => {
    useEffect(() => {
        // Clear all storage
        sessionStorage.clear();
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        localStorage.removeItem("userType");
        
        // Redirect to login after a delay
        const timer = setTimeout(() => {
            window.location.href = '/';
        }, 3000);
        
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="logout-container">
            <div className="logout-card">
                <div className="logout-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="#3760e6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 17L21 12L16 7" stroke="#3760e6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 12H9" stroke="#3760e6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <h1 className="logout-title">Logged Out Successfully</h1>
                <p className="logout-message">
                    You have been successfully logged out of your account.
                    <br />
                    Redirecting to home page in a few seconds...
                </p>
                <div className="logout-progress">
                    <div className="progress-bar">
                        <div className="progress-fill"></div>
                    </div>
                </div>
                <div className="logout-actions">
                    <a href="/" className="login-link">
                        Go to Home Page
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Logout;