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
        course: "",
        course_other: "",
        location: "",
        facebook: "",
        username: "",
        password: "",
        subjects_offered: [],
        hidePass: true,
        hideCPass: true
    });

    const [subjectsList, setSubjectsList] = useState([]);
    const [loadingSubjects, setLoadingSubjects] = useState(true);
    const [subjectCategories, setSubjectCategories] = useState({});

    const coursesList = [
        "BS Computer Science",
        "BS Information Technology",
        "BS Computer Engineering",
        "BS Electrical Engineering",
        "BS Civil Engineering",
        "BS Mechanical Engineering",
        "BS Chemical Engineering",
        "BS Electronics Engineering",
        "BS Industrial Engineering",
        "BS Architecture",
        "BS Nursing",
        "BS Medical Technology",
        "BS Pharmacy",
        "BS Physical Therapy",
        "BS Biology",
        "BS Chemistry",
        "BS Physics",
        "BS Mathematics",
        "BS Statistics",
        "BS Accountancy",
        "BS Business Administration",
        "BS Marketing",
        "BS Finance",
        "BS Economics",
        "BS Entrepreneurship",
        "BS Hospitality Management",
        "BS Tourism Management",
        "BS Psychology",
        "BS Education",
        "BS Elementary Education",
        "BS Secondary Education",
        "BS English",
        "BS History",
        "BS Political Science",
        "BS Social Work",
        "BS Communication",
        "BS Journalism",
        "BS Fine Arts",
        "BS Music",
        "BS Sports Science",
        "BS Agriculture",
        "BS Forestry",
        "BS Environmental Science",
        "BS Food Technology",
        "BS Nutrition and Dietetics",
        "Other"
    ];

    const navigate = useNavigate()
    const { first_name, middle_name, last_name, contact_number, username, password, email, course, course_other, location, facebook, subjects_offered } = pageVars
    const form = { 
        full_name: `${first_name || ""} ${middle_name || ""} ${last_name || ""}`.trim(), 
        contact_number, 
        username, 
        password, 
        email, 
        course: course === "Other" ? course_other : course, 
        location, 
        facebook, 
        subjects_offered: subjects_offered.map(subject => typeof subject === 'object' ? subject.id : subject)
    }

    // Fetch subjects from database on component mount
    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            setLoadingSubjects(true);
            // Fetch subjects from API
            const response = await apiCall({
                method: 'get',
                url: '/subjects',
                headers: {}
            });

            if (response.data.success) {
                const subjects = response.data.data || [];
                setSubjectsList(subjects);
                
                // Group subjects by category
                const grouped = {};
                subjects.forEach(subject => {
                    const category = subject.category || 'Other';
                    if (!grouped[category]) {
                        grouped[category] = [];
                    }
                    grouped[category].push(subject);
                });
                setSubjectCategories(grouped);
            } else {
                console.error("Failed to fetch subjects:", response.data.error);
            }
        } catch (error) {
            console.error("Error fetching subjects:", error);
        } finally {
            setLoadingSubjects(false);
        }
    };

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            if (password !== e.target.form.confirm_password.value) {
                alert("Passwords do not match.");
                return;
            }
            
            // Validate required fields
            if (!first_name || !last_name || !email || !username || !password) {
                alert("Please fill in all required fields.");
                return;
            }

            console.log("Submitting data:", form);
            
            const response = await apiCall({
                method: 'post',
                url: '/tutors/register',
                data: form,
                headers: {
                    'Access': 'tutor',
                },
                options: {
                    timeout: 10000
                }
            });

            if (response.data.success) {
                console.log("Registration successful:", response.data);
                if (response.data.data?.token) {
                    sessionStorage.setItem('token', response.data.data.token);
                    navigate("/tutor");
                } else {
                    alert("Registration successful! Please login.");
                    navigate("/tutor/login");
                }
            } else {
                alert(response.data.error || "Registration failed");
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

    function handleVarChange(key, e) {
        setPageVars({ ...pageVars, [key]: e.target.value });
    }

    function handleSubjectChange(subject) {
        setPageVars(prev => {
            const currentSubjects = [...prev.subjects_offered];
            const subjectId = typeof subject === 'object' ? subject.id : subject;
            
            // Check if subject is already selected
            const isSelected = currentSubjects.some(s => 
                (typeof s === 'object' ? s.id : s) === subjectId
            );
            
            if (isSelected) {
                return {
                    ...prev,
                    subjects_offered: currentSubjects.filter(s => 
                        (typeof s === 'object' ? s.id : s) !== subjectId
                    )
                };
            } else {
                return {
                    ...prev,
                    subjects_offered: [...currentSubjects, subject]
                };
            }
        });
    }

    const isSubjectSelected = (subject) => {
        const subjectId = typeof subject === 'object' ? subject.id : subject;
        return pageVars.subjects_offered.some(s => 
            (typeof s === 'object' ? s.id : s) === subjectId
        );
    };

    if (loadingSubjects) {
        return (
            <div className="form-container">
                <div className="loading-container">
                    <p>Loading subjects...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="form-container">
            <form>
                <h3>REGISTER AS TUTOR</h3>
                
                {/* Name Fields */}
                <div>
                    <label>Full Name *</label>
                    <input type="text" name="first_name" placeholder="First name" onChange={(e) => handleVarChange("first_name", e)} required />
                    <input type="text" name="middle_name" placeholder="Middle name" onChange={(e) => handleVarChange("middle_name", e)} />
                    <input type="text" name="last_name" placeholder="Last name" onChange={(e) => handleVarChange("last_name", e)} required />
                </div>

                <div>
                    <label>Email *</label>
                    <input type="email" name="email" onChange={(e) => handleVarChange("email", e)} required />
                </div>

                <div>
                    <label>Contact Number</label>
                    <input type="tel" name="contact_number" placeholder="+63" onChange={(e) => handleVarChange("contact_number", e)} />
                </div>
                
                <div>
                    <label>Username *</label>
                    <input type="text" name="username" onChange={(e) => handleVarChange("username", e)} required />
                </div>
                
                {/* KEEP YOUR ORIGINAL PASSWORD TOGGLE ICONS */}
                <div>
                    <label>Password *</label>
                    <span className="password-container">
                        <input type={pageVars.hidePass ? "password" : "text"} name="password" onChange={(e) => handleVarChange("password", e)} required />
                        <i onClick={() => setPageVars({ ...pageVars, hidePass: !pageVars.hidePass })}>
                            {pageVars.hidePass ? "🔒" : "🔓"}
                        </i>
                    </span>
                </div>
                
                <div>
                    <label>Confirm Password *</label>
                    <span className="password-container">
                        <input type={pageVars.hideCPass ? "password" : "text"} name="confirm_password" required />
                        <i onClick={() => setPageVars({ ...pageVars, hideCPass: !pageVars.hideCPass })}>
                            {pageVars.hideCPass ? "🔒" : "🔓"}
                        </i>
                    </span>
                </div>

                <div>
                    <label>Course Graduated</label>
                    <select name="course" onChange={(e) => handleVarChange("course", e)} value={pageVars.course}>
                        <option value="">Select Course</option>
                        {coursesList.map((course, index) => (
                            <option key={index} value={course}>{course}</option>
                        ))}
                    </select>
                    {pageVars.course === "Other" && (
                        <input 
                            type="text" 
                            name="course_other" 
                            placeholder="Please specify your course" 
                            onChange={(e) => handleVarChange("course_other", e)}
                            value={pageVars.course_other}
                            style={{marginTop: '10px'}}
                        />
                    )}
                </div>

                {/* Subjects Offered - Now from Database */}
                <div className="subjects-container">
                    <label>Subjects Offered</label>
                    <p className="subjects-help-text">Select the subjects you can teach</p>
                    
                    {Object.keys(subjectCategories).length > 0 ? (
                        Object.entries(subjectCategories).map(([category, subjects]) => (
                            <div key={category} className="subject-category">
                                <h4>{category}</h4>
                                <div className="subjects-checklist">
                                    {subjects.map((subject) => (
                                        <div key={subject.id} className="subject-checkbox">
                                            <input
                                                type="checkbox"
                                                id={`subject-${subject.id}`}
                                                checked={isSubjectSelected(subject)}
                                                onChange={() => handleSubjectChange(subject)}
                                            />
                                            <label htmlFor={`subject-${subject.id}`}>
                                                {subject.name}
                                                {subject.description && (
                                                    <span className="subject-description"> - {subject.description}</span>
                                                )}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No subjects available. Please contact administrator.</p>
                    )}
                    
                    {pageVars.subjects_offered.length > 0 && (
                        <div className="selected-subjects">
                            <strong>Selected Subjects ({pageVars.subjects_offered.length}): </strong>
                            {pageVars.subjects_offered.map((subject, index) => (
                                <span key={index} className="selected-subject-tag">
                                    {typeof subject === 'object' ? subject.name : subject}
                                    {index < pageVars.subjects_offered.length - 1 ? ", " : ""}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <label>Location</label>
                    <input type="text" name="location" placeholder="City, Province" onChange={(e) => handleVarChange("location", e)} />
                </div>

                <div>
                    <label>Facebook Profile (Optional)</label>
                    <input type="url" name="facebook" placeholder="https://facebook.com/username" onChange={(e) => handleVarChange("facebook", e)} />
                </div>
                
                <button type="button" onClick={handleSubmit} className="submit-btn">Register</button>
                <p className="form-switch">Already have an Account? <Link to={"/tutor/login"}>Login</Link></p>
            </form>
        </div>
    )
}

export default Register;