import { useState, useEffect } from "react"
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

    const [errors, setErrors] = useState({
        contact_number: "",
        password: "",
        username: ""
    });

    const [passwordStrength, setPasswordStrength] = useState({
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false,
        isLengthValid: false
    });

    const navigate = useNavigate()
    const { first_name, middle_name, last_name, contact_number, email, username, password } = pageVars
    const form = {
        full_name: `${first_name || ""} ${middle_name || ""} ${last_name || ""}`.trim(),
        contact_number,
        email,
        username,
        password
    }

    // Validate password whenever it changes
    useEffect(() => {
        validatePassword(pageVars.password);
    }, [pageVars.password]);

    const validatePassword = (password) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        const isLengthValid = password.length >= 8;

        setPasswordStrength({
            hasUpperCase,
            hasLowerCase,
            hasNumber,
            hasSpecialChar,
            isLengthValid
        });

        // Check if all requirements are met
        if (password && (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar || !isLengthValid)) {
            setErrors(prev => ({
                ...prev,
                password: "Password must contain at least 1 uppercase, 1 lowercase, 1 number, 1 special character, and be at least 8 characters long"
            }));
        } else {
            setErrors(prev => ({
                ...prev,
                password: ""
            }));
        }
    };

    const handleContactNumberChange = (e) => {
        let value = e.target.value;

        // Remove any non-digit characters
        value = value.replace(/\D/g, '');

        // Limit to 11 digits
        if (value.length > 11) {
            value = value.substring(0, 11);
        }

        // Update the state
        setPageVars({ ...pageVars, contact_number: value });

        // Validate on the fly (only if user has entered something)
        if (value) {
            if (value.length !== 11) {
                setErrors(prev => ({
                    ...prev,
                    contact_number: "Contact number must be exactly 11 digits"
                }));
            } else {
                setErrors(prev => ({
                    ...prev,
                    contact_number: ""
                }));
            }
        } else {
            setErrors(prev => ({
                ...prev,
                contact_number: ""
            }));
        }
    };

    const handleUsernameChange = (e) => {
        let value = e.target.value;

        // Remove spaces from username
        value = value.replace(/\s+/g, '');

        // Check if username contains spaces (multiple words)
        const hasSpaces = /\s/.test(e.target.value);

        setPageVars({ ...pageVars, username: value });

        // Validate on the fly
        if (hasSpaces) {
            setErrors(prev => ({
                ...prev,
                username: "Username must be a single word (no spaces allowed)"
            }));
        } else if (value && !/^[a-zA-Z0-9_]+$/.test(value)) {
            setErrors(prev => ({
                ...prev,
                username: "Username can only contain letters, numbers, and underscores"
            }));
        } else {
            setErrors(prev => ({
                ...prev,
                username: ""
            }));
        }
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPageVars({ ...pageVars, password: value });
    };

    function handleVarChange(key, e) {
        if (key === "password") {
            handlePasswordChange(e);
        } else if (key === "contact_number") {
            handleContactNumberChange(e);
        } else if (key === "username") {
            handleUsernameChange(e);
        } else {
            setPageVars({ ...pageVars, [key]: e.target.value });
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        // Validate required fields
        if (!first_name || !last_name || !email || !username || !password || !contact_number) {
            alert("Please fill in all required fields.");
            return;
        }

        // Validate contact number before submission
        if (!/^\d{11}$/.test(pageVars.contact_number)) {
            setErrors(prev => ({
                ...prev,
                contact_number: "Contact number must be exactly 11 digits"
            }));
            alert("Please enter a valid 11-digit contact number");
            return;
        }

        // Validate username before submission
        if (/\s/.test(username)) {
            setErrors(prev => ({
                ...prev,
                username: "Username must be a single word (no spaces allowed)"
            }));
            alert("Username cannot contain spaces");
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            setErrors(prev => ({
                ...prev,
                username: "Username can only contain letters, numbers, and underscores"
            }));
            alert("Username can only contain letters, numbers, and underscores");
            return;
        }

        // Validate password requirements
        const { hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar, isLengthValid } = passwordStrength;
        if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar || !isLengthValid) {
            setErrors(prev => ({
                ...prev,
                password: "Password must contain at least 1 uppercase, 1 lowercase, 1 number, 1 special character, and be at least 8 characters long"
            }));
            alert("Please ensure your password meets all requirements");
            return;
        }

        if (password !== e.target.form.confirm_password.value) {
            alert("Passwords do not match.");
            return;
        }

        // Clear any previous errors
        setErrors({ contact_number: "", password: "", username: "" });

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
                navigate("/parent");
            }
        } catch (error) {
            console.error("Registration error:", error);
            if (error.response && error.response.status === 400) {
                if (error.response.data && error.response.data.error === 'Email or username already exists') {
                    alert("Email or username already exists");
                } else {
                    alert(error.response.data?.error || "Username or email already taken");
                }
            } else {
                alert(error.response?.data?.error || error.message || "Registration failed");
            }
        }
    }

    const getPasswordValidationClass = (condition) => {
        return condition ? "valid" : "invalid";
    };

    return (
        <div className="form-container">
            <form>
                <h3>REGISTER</h3>
                <div>
                    <label>Full Name</label>
                    <input type="text" name="first_name" placeholder="First name" onChange={(e) => handleVarChange("first_name", e)} required />
                    <input type="text" name="middle_name" placeholder="Middle name" onChange={(e) => handleVarChange("middle_name", e)} />
                    <input type="text" name="last_name" placeholder="Last name" onChange={(e) => handleVarChange("last_name", e)} required />
                </div>

                <div>
                    <label>Contact Number</label>
                    <p className="field-help-text">
                        <small>Format: 09XXXXXXXXX (11 digits total)</small>
                    </p>
                    <input
                        type="tel"
                        name="contact_number"
                        placeholder="09XXXXXXXXX (11 digits)"
                        value={pageVars.contact_number}
                        onChange={(e) => handleVarChange("contact_number", e)}
                        pattern="\d{11}"
                        maxLength="11"
                        title="Please enter exactly 11 digits"
                        required
                    />
                    {errors.contact_number && (
                        <p className="error-message">
                            {errors.contact_number}
                        </p>
                    )}
                    
                </div>

                <div>
                    <label>Email</label>
                    <input type="email" name="email" onChange={(e) => handleVarChange("email", e)} required />
                </div>

                <div>
                    <label>Username</label>
                    <p className="field-help-text">
                        <small>Username must be a single word (no spaces allowed)</small>
                    </p>
                    <input
                        type="text"
                        name="username"
                        value={pageVars.username}
                        onChange={(e) => handleVarChange("username", e)}
                        pattern="^\S+$"
                        title="Username cannot contain spaces"
                        required
                    />

                    {errors.username && (
                        <p className="error-message">
                            {errors.username}
                        </p>
                    )}

                </div>

                <div>
                    <label>Password</label>
                    <span className="password-container">
                        <input
                            type={pageVars.hidePass ? "password" : "text"}
                            name="password"
                            onChange={(e) => handleVarChange("password", e)}
                            required
                        />
                        <i onClick={() => setPageVars({ ...pageVars, hidePass: !pageVars.hidePass })}>
                            {pageVars.hidePass ? "🔒" : "🔓"}
                        </i>
                    </span>

                    {/* Password Validation Checklist */}
                    <div className="password-validation">
                        <p><strong>Password must contain:</strong></p>
                        <ul>
                            <li className={getPasswordValidationClass(passwordStrength.hasUpperCase)}>
                                {passwordStrength.hasUpperCase ? "✓" : "✗"} At least one uppercase letter (A-Z)
                            </li>
                            <li className={getPasswordValidationClass(passwordStrength.hasLowerCase)}>
                                {passwordStrength.hasLowerCase ? "✓" : "✗"} At least one lowercase letter (a-z)
                            </li>
                            <li className={getPasswordValidationClass(passwordStrength.hasNumber)}>
                                {passwordStrength.hasNumber ? "✓" : "✗"} At least one number (0-9)
                            </li>
                            <li className={getPasswordValidationClass(passwordStrength.hasSpecialChar)}>
                                {passwordStrength.hasSpecialChar ? "✓" : "✗"} At least one special character (!@#$%^&* etc.)
                            </li>
                            <li className={getPasswordValidationClass(passwordStrength.isLengthValid)}>
                                {passwordStrength.isLengthValid ? "✓" : "✗"} Minimum 8 characters long
                            </li>
                        </ul>
                    </div>

                    {errors.password && (
                        <p className="error-message">
                            {errors.password}
                        </p>
                    )}
                </div>

                <div>
                    <label>Confirm Password</label>
                    <span className="password-container">
                        <input type={pageVars.hideCPass ? "password" : "text"} name="confirm_password" required />
                        <i onClick={() => setPageVars({ ...pageVars, hideCPass: !pageVars.hideCPass })}>
                            {pageVars.hideCPass ? "🔒" : "🔓"}
                        </i>
                    </span>
                </div>

                <button type="button" onClick={(e) => handleSubmit(e)}>Submit</button>
                <p className="form-switch">Already have an Account? <Link to={"/parent/login"}>Login</Link></p>
            </form>

            {/* Add some CSS for the validation indicators */}
            <style jsx>{`
                .password-validation {
                    margin-top: 10px;
                }
                .password-validation ul {
                    list-style: none;
                    padding: 0;
                    margin: 5px 0;
                }
                .password-validation li {
                    font-size: 0.8rem;
                    margin-bottom: 3px;
                }
                .password-validation li.valid {
                    color: green;
                }
                .password-validation li.invalid {
                    color: #666;
                }
                .error-message {
                    color: red;
                    font-size: 0.8rem;
                    margin-top: 5px;
                    margin-bottom: 0;
                }
                .field-help-text {
                    font-size: 0.8rem;
                    color: #666;
                    margin-top: 5px;
                    margin-bottom: 0;
                }
                input:invalid {
                    border-color: #ff4444;
                }
            `}</style>
        </div>
    )
}

export default Register