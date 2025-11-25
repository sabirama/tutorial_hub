import { useState } from "react"
import { Link, useNavigate } from "react-router-dom";
import apiCall from "../../../middlewares/api/axios";

const Register = () => {
    const [pageVars, setPageVars] = useState({
        first_name: "",
        middle_name: "",
        last_name: "",
        contact_number: "",
        email: "",
        username: "",
        password: "",
        hidePass: true,
        hideCPass: true
    });

    const navigate = useNavigate()
    const { first_name, middle_name, last_name, contact_number, email, username, password } = pageVars
    const form = { full_name: `${first_name || ""} ${middle_name || ""} ${last_name || ""}`.trim(), contact_number, email, username, password }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            const response = await apiCall({
                method: 'post',
                url: '/parents/register',
                data: form,
                headers: {
                    'Access': 'parent',
                },
                options: {
                    timeout: 10000
                }
            })
            if (response.data.data) {
                sessionStorage.setItem('token', response.data.data.token);
                navigate("/parent/dashboard");
            }
        } catch (e) {
            alert(e.message);
        }
    }

    function handleVarChange(key, e) {
        setPageVars({ ...pageVars, [key]: e.target.value });
    }

    return (
        <div className="form-container">
            <form>
                <h3>REGISTER</h3>
               <div>
                    <label>Full Name</label>
                    <input type="text" name="first_name" placeholder="first name" onChange={(e) => handleVarChange("first_name", e)} />
                    <input type="text" name="middle_name" placeholder="middle name" onChange={(e) => handleVarChange("middle_name", e)} />
                    <input type="text" name="last_name" placeholder="last name" onChange={(e) => handleVarChange("last_name", e)} />
                </div>

                <div>
                    <label>Contact Number</label>
                    <input type="text" name="contact_number" onChange={(e) => handleVarChange("contact_number", e)} />
                </div>

                <div>
                    <label>Email</label>
                    <input type="text" name="email" onChange={(e) => handleVarChange("email", e)} />
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
                        <input type={pageVars.hideCPass ? "password" : "text"} name="confirm_password" />
                        <i onClick={(e) => { setPageVars({ ...pageVars, hideCPass: !pageVars.hideCPass }, e) }}>{pageVars.hideCPass ? "🔒" : "🔓"}</i>
                    </span>
                </div>
                <button onClick={(e) => handleSubmit(e)}>Submit</button>
                <p className="form-switch">Already have an Account? <Link to={"/parent/login"}>Login</Link></p>
            </form>
        </div>
    )
}

export default Register

