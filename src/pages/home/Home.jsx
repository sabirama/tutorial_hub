import Hero from "./modules/Hero"
import Roles from "./modules/Roles"
import "../../assets/css/Home.css"
import apiCall from "../../middlewares/api/axios"

const Home = () => {
    return (
        <div className="page">
            <Hero />
            <button onClick={() => apiCall({ method: 'post', url: '/', data: {'name': 'waner'}, headers:{'Token': 'test'} })}>API CHECK</button>
            <Roles />
        </div>
    )
}

export default Home