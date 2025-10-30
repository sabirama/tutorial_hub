import { useState } from "react"
import { setAuth } from "../../../middlewares/auth/auth";

const Login = () => {
    const [pageVars, setPageVars] = useState({
        username: "",
        password: "",
        hidePass: true
    });

    const creds = { username: import.meta.env.VITE_ADMIN_USERNAME, password: import.meta.env.VITE_ADMIN_PASSWORD }

    function handleSubmit(e) {
        e.preventDefault();
        if (pageVars.username !== creds.username || pageVars.password !== creds.password) {
            alert("Invalid credentials");
        } else {
            setAuth({ username: pageVars.username, user: "admin" }, true);
            window.location.href = "/admin/dashboard";
        }

    }

    function handleVarChange(key, e) {
        setPageVars({ ...pageVars, [key]: e.target.value });
    }

    return (
        <div className="form-container">
            <form>
                <h3>LOGIN</h3>

                <div>
                    <label>Username</label>
                    <input type="text" name="username" onChange={(e) => handleVarChange("username", e)} />
                </div>
                <div>
                    <label>Password</label>
                    <span className="password-container">
                        <input type={pageVars.hidePass ? "password" : "text"} name="password" onChange={(e) => handleVarChange("password", e)} />
                        <i onClick={(e) => { setPageVars({ ...pageVars, hidePass: !pageVars.hidePass }, e) }}>{pageVars.hidePass ? "🔒" : "🔓"}</i>
                    </span>
                </div>
                <button onClick={handleSubmit}>Submit</button>
            </form>
        </div>
    )
}

export default Login

