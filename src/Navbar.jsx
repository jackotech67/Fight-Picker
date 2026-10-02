import { Link } from "react-router-dom";

function Navbar ({ 
    unlockAdmin, 
    lockAdmin, 
    isAdmin, 
    importUpcoming,
    importPast,
    pastEventSlug,
    setPastEventSlug 
}) {
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
                    <div className="admin-import-controls">
                        <button onClick={importUpcoming}>
                            Import Upcoming Event
                        </button>
                        <input
                            type="text"
                            placeholder="Event slug e.g. ufc-332"
                            value={pastEventSlug}
                            onChange={(e) => setPastEventSlug(e.target.value)}
                        />
                        <button onClick={importPast}>
                            Import / Update Past Event
                        </button>
                    </div>
                    <button onClick={lockAdmin}>
                        Exit
                    </button>
                </>
            )}
        </nav>
    );
}

export default Navbar;