import { useState } from "react"
import { Link, useNavigate } from "react-router-dom";
import apiCall from "../../../middlewares/api/axios";

const Login = () => {
    const [pageVars, setPageVars] = useState({
        username: "",
        password: "",
        hidePass: true,
        loading: false
    });

    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate()
    const { username, password, loading } = pageVars;
    const form = { username, password }

    async function handleSubmit(e) {
        e.preventDefault();
        
        setErrorMessage("");
        
        if (!username.trim()) {
            setErrorMessage("Username is required");
            return;
        }
        
        if (!password.trim()) {
            setErrorMessage("Password is required");
            return;
        }

        setPageVars(prev => ({ ...prev, loading: true }));

        try {
            const response = await apiCall({
                method: 'post',
                url: '/tutors/login',
                data: form,
                headers: {
                    'Access': 'tutor',  // CHANGED FROM 'parent' TO 'tutor'
                },
                options: {
                    timeout: 10000
                }
            })

            if (response.data.data) {
                sessionStorage.setItem('token', response.data.data.token);
                navigate("/tutor");  // CHANGED FROM "/parent" TO "/tutor"
            }
        } catch (e) {
            console.error("Login error:", e);
            
            let errorMsg = "Login failed";
            
            if (e.response) {
                if (e.response.status === 401) {
                    errorMsg = "Invalid username or password";
                } else if (e.response.status === 500) {
                    errorMsg = "Server error";
                } else if (e.response.data?.error) {
                    errorMsg = e.response.data.error;
                }
            } else if (e.request) {
                errorMsg = "No response from server";
            } else {
                errorMsg = e.message;
            }
            
            setErrorMessage(errorMsg);
        } finally {
            setPageVars(prev => ({ ...prev, loading: false }));
        }
    }

    function handleVarChange(key, e) {
        setPageVars({ ...pageVars, [key]: e.target.value });
        if (errorMessage) setErrorMessage("");
    }

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit}>
                <h3>LOGIN</h3>

                {errorMessage && (
                    <div style={{
                        color: 'red',
                        backgroundColor: '#ffebee',
                        padding: '10px',
                        borderRadius: '4px',
                        marginBottom: '15px'
                    }}>
                        {errorMessage}
                    </div>
                )}

                <div>
                    <label>Username</label>
                    <input 
                        type="text" 
                        name="username" 
                        value={username}
                        onChange={(e) => handleVarChange("username", e)}
                        disabled={loading}
                    />
                </div>
                <div>
                    <label>Password</label>
                    <span className="password-container">
                        <input 
                            type={pageVars.hidePass ? "password" : "text"} 
                            name="password" 
                            value={password}
                            onChange={(e) => handleVarChange("password", e)}
                            disabled={loading}
                        />
                        <i 
                            onClick={() => setPageVars({ ...pageVars, hidePass: !pageVars.hidePass })}
                            style={{ cursor: 'pointer' }}
                        >
                            {pageVars.hidePass ? "🔒" : "🔓"}
                        </i>
                    </span>
                </div>
                
                <button 
                    type="submit"
                    onClick={handleSubmit}
                    disabled={loading || !username.trim() || !password.trim()}
                    style={{ opacity: loading ? 0.7 : 1 }}
                >
                    {loading ? "Loading..." : "Submit"}
                </button>
                
                <p className="form-switch">Don't have an Account? <Link to={"/tutor/register"}>Register</Link></p>
            </form>
        </div>
    )
}

export default Login