import { useState } from "react"
import { Link } from "react-router-dom";

const Login = () => {
    const [pageVars, setPageVars] = useState({
        username: "",
        password: "",
        hidePass: true
    });

    function handleSubmit(e) {
        e.preventDefault();
        alert(JSON.stringify(pageVars));
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
               <p className="form-switch">Don't have an Account? <Link to={"/parent/register"}>Register</Link></p>
            </form>
        </div>
    )
}

export default Login

