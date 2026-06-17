function Navbar ({
    unlockAdmin, lockAdmin, isAdmin
}) {
    return (
        <nav className="navbar">
            <button onClick={unlockAdmin}>
                Admin
            </button>
            {isAdmin && (
                <button onClick={lockAdmin}>
                    Exit
                </button>
            )}
        </nav>
    );
}

export default Navbar;