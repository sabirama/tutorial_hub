import { Routes, Route, Link } from "react-router-dom"
import { logout } from "../../../../middlewares/auth/auth"
import ParentsManager from "./modules/ParentsManager"
import TutorsManager from "./modules/TutorsManager"
import { useState } from "react"
import Sessions from "./modules/Sessions"
import AdminDashboard from './modules/AdminDashBoard';

const DashboardRoutes = [
    {
        name: "dashboard",
        path: "/",
        element: AdminDashboard
    },
    {
        name: "parents",
        path: "/parents",
        element: ParentsManager
    },
    {
        name: "tutors",
        path: "/tutors",
        element: TutorsManager
    },
    {
        name: "sessions",
        path: "/sessions",
        element: Sessions
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
                        <Link to={"/admin/dashboard"}>Dashboard</Link>
                    </li>
                    <li>
                        <Link to={"/admin/dashboard/parents"}>Parents</Link>
                    </li>
                    <li>
                        <Link to={"/admin/dashboard/tutors"}>Tutors</Link>
                    </li>
                    <li>
                        <Link to={"/admin/Logout"} onClick={logout}>Logout</Link>
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