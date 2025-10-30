import { useState } from "react"
import { Link, useNavigate} from "react-router-dom";

const Register = () => {
    const [pageVars, setPageVars] = useState({
        full_name: "",
        contact_number: "",
        username: "",
        password: "",
        hidePass: true,
        hideCPass: true
    });
 const navigate = useNavigate()

    function handleSubmit(e) {1
        e.preventDefault();
        navigate("/parent/dashboard")
    }

    function handleVarChange(key, e) {
        setPageVars({ ...pageVars, [key]: e.target.value });
    }

    const { full_name, contact_number, username, password } = pageVars
    const form = { full_name, contact_number, username, password }

    return (
        <div className="form-container">
            <form>
                <h3>REGISTER</h3>
                <div>
                    <label>Ful Name</label>
                    <input type="text" name="full_name" onChange={(e) => handleVarChange("full_name", e)} />
                </div>
                <div>
                    <label>Contact Number</label>
                    <input type="text" name="fcontact_number" onChange={(e) => handleVarChange("contact_number", e)} />
                </div>
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
                <div>
                    <label>Confirm Password</label>
                    <span className="password-container">
                        <input type={pageVars.hidePass ? "password" : "text"} name="confirm_password" />
                        <i onClick={(e) => { setPageVars({ ...pageVars, hideCPass: !pageVars.hideCPass }, e) }}>{pageVars.hideCPass ? "🔒" : "🔓"}</i>
                    </span>
                </div>
                <button onClick={handleSubmit}>Submit</button>
                <p className="form-switch">Already have an Account? <Link to={"/parent/login"}>Login</Link></p>
            </form>
        </div>
    )
}

export default Register

