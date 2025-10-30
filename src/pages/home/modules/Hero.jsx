import { HashLink } from "react-router-hash-link"

const Hero = () => {
    return (
        <section className="hero">
            <h2>Connecting Parents and Tutors Easily</h2>
            <p>Join our platform to find the best tutors or share your knowledge with eager learners. Simple. Fast. Effective.</p>
            <HashLink to={"#roles"}>GET STARTED</HashLink>
        </section>
    )
}

export default Hero