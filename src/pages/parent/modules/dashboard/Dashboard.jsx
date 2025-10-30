import { Routes, Route, Link } from "react-router-dom";
import Sessions from "./modules/Sessions";
import ParentProfile from "./modules/Profile";
import ParentTutors from "./modules/ParentTutors";
import TutorsDirectory from "./modules/TutorsDirectory";
import { useState } from "react";

const DashboardRoutes = [
    {
        name: "dashboard",
        path: "/",
        element: ParentProfile
    },
    {
        name: "sessions",
        path: "/sessions",
        element: Sessions
    },
    {
        name: "tutors",
        path: "/mytutors",
        element: ParentTutors
    },
    {
        name: "explore_tutors",
        path: "/explore_tutors",
        element: TutorsDirectory
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
                        <Link to={"/parent/dashboard"}>Dashboard</Link>
                    </li>
                    <li>
                        <Link to={"/parent/dashboard/sessions"}>Sessions</Link>
                    </li>
                    <li>
                        <Link to={"/parent/dashboard/mytutors"}>My Tutors</Link>
                    </li>
                    <li>
                        <Link to={"/parent/dashboard/explore_tutors"}>All Tutors</Link>
                    </li>
                    <li>
                        <Link to={"/parent/Logout"}>Logout</Link>
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