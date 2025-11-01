import { Route, Routes } from "react-router-dom"
import Dashboard from "./modules/dashboard/Dashboard"
import Login from "./modules/Login"
import Register from "./modules/Register"
import "../../assets/css/AuthForm.css"
import "../../assets/css/Aside.css";

const pageRoutes = [
    {
        name: "dashboard",
        path: "/*",
        element: Dashboard
    },
    {
        name: "login",
        path: "/login",
        element: Login
    },
    {
        name: "register",
        path: "/register",
        element: Register
    },

]

const Parent = () => {
    return (
        <div className="page">
            <Routes>
                {
                    pageRoutes.map((r, i) => {
                        return (
                            <Route key={i} path={r.path} element={<r.element />} />
                        )
                    })
                }
            </Routes>
        </div>
    )
}

export default Parent