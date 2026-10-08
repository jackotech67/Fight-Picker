import { Link } from "react-router-dom";

function Navbar ({ 
    unlockAdmin, 
    lockAdmin, 
    isAdmin 
}) {
    return (
        <nav className="navbar">
            <Link to="/">
                <button className="home-button">Home</button>
            </Link>
            
            <div className="navbar-right">
                <Link to="/events">
                    <button>Events</button>
                </Link>
                <Link to="/fighters">
                    <button>Fighters</button>
                </Link>
                {!isAdmin && (
                    <button onClick={unlockAdmin}>
                        Admin
                    </button>
                )}
                 {isAdmin && (
                    <>  
                        <button onClick={lockAdmin}>
                            Exit
                        </button>
                    </>
                )}
            </div>

            
        </nav>
    );
}

export default Navbar;