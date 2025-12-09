import { Link } from "react-router-dom"
import "../../css/Header.css";
import { useState } from "react"

const Header = () => {
    const [user, setUser] = useState('parent');
    
    return (
        <header>
            <Link to={"/"} className="logo">TUTORIAL HUB</Link>
        </header>
    )
}

export default Header