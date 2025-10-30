import { useState } from "react"
import { Link } from "react-router-dom";

const Register = () => {
    const [pageVars, setPageVars] = useState({
        full_name: "",
        contact_number: "",
        email: "",
        course: "",
        location: "",
        facebook: "",
        username: "",
        password: "",
        subjects_offered: [],
        hidePass: true,
        hideCPass: true
    });

    const subjectsList = [
        "Mathematics",
        "Physics",
        "Chemistry",
        "Biology",
        "English",
        "History",
        "Computer Science",
        "Programming",
        "Statistics",
        "Economics",
        "Accounting",
        "Business Studies",
        "Geography",
        "Literature",
        "Spanish",
        "French",
        "German",
        "Art",
        "Music",
        "Physical Education"
    ];

    function handleSubmit(e) {
        e.preventDefault();
        alert(JSON.stringify(form));
    }

    function handleVarChange(key, e) {
        setPageVars({ ...pageVars, [key]: e.target.value });
    }

    function handleSubjectChange(subject) {
        setPageVars(prev => {
            const currentSubjects = [...prev.subjects_offered];
            if (currentSubjects.includes(subject)) {
                return {
                    ...prev,
                    subjects_offered: currentSubjects.filter(s => s !== subject)
                };
            } else {
                return {
                    ...prev,
                    subjects_offered: [...currentSubjects, subject]
                };
            }
        });
    }

    const { full_name, contact_number, username, password, email, course, location, facebook, subjects_offered } = pageVars
    const form = { full_name, contact_number, username, password, email, course, location, facebook, subjects_offered }

    return (
        <div className="form-container">
            <form>
                <h3>REGISTER</h3>
                <div>
                    <label>Full Name</label>
                    <input type="text" name="full_name" onChange={(e) => handleVarChange("full_name", e)} />
                </div>

                <div>
                    <label>Email</label>
                    <input type="text" name="email" onChange={(e) => handleVarChange("email", e)} />
                </div>

                <div>
                    <label>Contact Number</label>
                    <input type="text" name="contact_number" onChange={(e) => handleVarChange("contact_number", e)} />
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

                <div>
                    <label>Course Graduated</label>
                    <input type="text" name="course" onChange={(e) => handleVarChange("course", e)} />
                </div>

                <div className="subjects-container">
                    <label>Subjects Offered</label>
                    <div className="subjects-checklist">
                        {subjectsList.map((subject, index) => (
                            <div key={index} className="subject-checkbox">
                                <input
                                    type="checkbox"
                                    id={`subject-${index}`}
                                    checked={pageVars.subjects_offered.includes(subject)}
                                    onChange={() => handleSubjectChange(subject)}
                                />
                                <label htmlFor={`subject-${index}`}>{subject}</label>
                            </div>
                        ))}
                    </div>
                    {pageVars.subjects_offered.length > 0 && (
                        <div className="selected-subjects">
                            <strong>Selected: </strong>
                            {pageVars.subjects_offered.join(", ")}
                        </div>
                    )}
                </div>

                <div>
                    <label>Location</label>
                    <input type="text" name="location" onChange={(e) => handleVarChange("location", e)} />
                </div>

                <div>
                    <label>Facebook Profile</label>
                    <input type="text" name="facebook" onChange={(e) => handleVarChange("facebook", e)} />
                </div>
                <button onClick={handleSubmit}>Submit</button>
                <p className="form-switch">Already have an Account? <Link to={"/tutor/login"}>Login</Link></p>
            </form>
        </div>
    )
}

export default Register