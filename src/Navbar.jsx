import { Link } from "react-router-dom";

function Navbar ({ unlockAdmin, lockAdmin, isAdmin }) {
    return (
        <nav className="navbar">
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
        </nav>
    );
}

export default Navbar;