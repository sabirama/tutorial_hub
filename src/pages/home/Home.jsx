import Hero from "./modules/Hero"
import Roles from "./modules/Roles"
import "../../assets/css/Home.css"

const Home = () => {
    return (
        <div className="page">
            <Hero />
            <Roles />
        </div>
    )
}

export default Home