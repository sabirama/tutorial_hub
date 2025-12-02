import Home from "./home/Home";
import Admin from "./admin/Admin";
import Parent from "./parent/Parent";
import Tutor from "./tutor/Tutor";
import Logout from "./logout/Logout";

const MainRoutes = [
    {
        name: "home",
        path: "/",
        element: Home
    },
     {
        name: "admin",
        path: "/admin/*",
        element: Admin
    },
    {
        name: "parent",
        path: "/parent/*",
        element: Parent
    },
    {
        name: "tutor",
        path: "/tutor/*",
        element: Tutor
    },
    {
        name: "logout",
        path: "/logout",
        element: Logout
    }
];

export default MainRoutes