import { Routes, Route, Link, useNavigate } from "react-router-dom"
import { getAuth, logout } from "../../../../middlewares/auth/auth"
import { useEffect, useState } from "react"
import AdminDashboard from './modules/AdminDashBoard';

const DashboardRoutes = [
    {
        name: "dashboard",
        path: "/",
        element: AdminDashboard
    },
]

const Dashboard = () => {
    const [isActive, setIsActive] = useState(true);
    const nav = useNavigate();

    const toggleDashboard = () => {
       setIsActive(!isActive);
    }   

   useEffect(() => {
        const auth = getAuth();
        if (!auth || auth.user !== "admin") {
            nav("/admin/login");
        }   
    }, []);

    return (
        <>  
            <aside id="sidebar" className={isActive ? "active" : "inactive"}>
                <button className="mov" onClick={toggleDashboard}>☰</button>
                <ul>
                    <li className="dashboard">
                        <Link to={"/admin"}>Dashboard</Link>
                    </li>
                    <li>
                        <Link to={"/Logout"} onClick={logout}>Logout</Link>
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