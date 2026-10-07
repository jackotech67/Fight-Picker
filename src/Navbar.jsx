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
                <Link to="/fighters">
                    <button>Fighters</button>
                </Link>
                <button onClick={unlockAdmin}>
                Admin
                </button>
                
                 {isAdmin && (
                    <>  
                        <Link to="/fighters/new">
                            <button>Add Fighter</button>
                        </Link>
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