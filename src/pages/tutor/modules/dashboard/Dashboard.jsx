import { Routes, Route, Link } from "react-router-dom";
import Sessions from "./modules/Sessions";
import TutorProfile from "./modules/Profile";
import TutorParents from "./modules/TutorParents";
import { useState } from "react";
import SessionRequest from "./modules/SessionRequest";

const DashboardRoutes = [
    {
        name: "sessions",
        path: "/sessions",
        element: Sessions
    },
    {
        name: "tutored parents",
        path: "/tutee",
        element: TutorParents
    },
     {
        name: "session request",
        path: "/session-request",
        element: SessionRequest
    },

]

const Dashboard = () => {
    const [isActive, setIsActive] = useState(true);

    const toggleDashboard = () => {
        setIsActive(!isActive);
    }

    return (
        <>
             <aside id="sidebar" className={isActive ? "active" : "inactive"}>
                <button className="mov" onClick={toggleDashboard}>☰</button>
                <ul>
                    <li className="dashboard">
                        <Link to={"/tutor/dashboard"}>Dashboard</Link>
                    </li>
                    <li>
                        <Link to={"/tutor/sessions"}>Sessions</Link>
                    </li>
                    <li>
                        <Link to={"/tutor/tutee"}>Tutored</Link>
                    </li>
                     <li>
                        <Link to={"/tutor/session-request"}>Session Request</Link>
                    </li>
                    <li>
                        <Link to={"/tutor/Logout"}>Logout</Link>
                    </li>
                </ul>
            </aside>
            <div className="dashboard-content">
                <Routes>
                    {DashboardRoutes.map((r, i) => {
                        return (
                            <Route key={i} path={r.path} element={<r.element />} />
                        )
                    })}
                </Routes>
            </div>
        </>
    )
}

export default Dashboard