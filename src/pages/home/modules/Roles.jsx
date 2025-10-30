import { Link } from "react-router-dom"
const Roles = () => {
    return (
        <section id="roles" className="sections">
            <div className="card">
                <h3>I'm a Parent</h3>
                <p>Find expert tutors in any subject and book sessions with ease.</p>
                <Link to={'/parent/login'}>Login</Link>
                <Link to={'/parent/register'} id="parent-register">Register</Link>
            </div>

            <div className="card">
                <h3>I'm a Tutor</h3>
                <p>Grow your teaching career by connecting with motivated students.</p>
                <Link to={'/tutor/login'}>Login</Link>
                <Link to={'/tutor/register'} id="tutor-register">Register</Link>
            </div>
        </section>
    )
}

export default Roles