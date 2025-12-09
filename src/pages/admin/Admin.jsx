import { Routes, Route } from "react-router-dom";
import Dashboard from "./modules/dashboard/Dashboard";
import Login from "./modules/Login";
import "../../assets/css/Aside.css";

const PageRoutes = [
    {
        name: "main",
        path: "/*",
        element: Dashboard
    },
    {
        name: "login",
        path: "/login",
        element: Login
    }
]

const Admin = () => {

    return (
        <div className="page">
            <Routes>
                {
                    PageRoutes.map((r, i) => (<Route key={i} path={r.path} element={<r.element />} />))
                }
            </Routes>
        </div>
    )
}

export default Admin