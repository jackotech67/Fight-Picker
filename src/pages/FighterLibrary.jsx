import Navbar from "../components/Navbar";
import FighterCard from "../components/FighterCard";
import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const weightClasses = [
    "Flyweight",
    "Bantamweight",
    "Featherweight",
    "Lightweight",
    "Welterweight",
    "Middleweight",
    "Light Heavyweight",
    "Heavyweight",
];

function FighterLibrary({ isAdmin, unlockAdmin, lockAdmin}) {

    const [fighters, setFighters] = useState([]);
    const [selectedWeightClass, setSelectedWeightClass] = useState("Lightweight");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetch(`${API_URL}/fighters?weightClass=${encodeURIComponent(selectedWeightClass)}`)
            .then((response) => response.json())
            .then((data) => setFighters(data));
    }, [selectedWeightClass]);

    const filteredFighters = fighters.filter((fighter => {
        const fullName = `${fighter.firstName} ${fighter.lastName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
    }));

    function deleteFighter(idToDelete) {
        console.log("Deleting fighter:", idToDelete);

        fetch(`${API_URL}/fighters/${idToDelete}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${sessionStorage.getItem("adminToken")}`
            }
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to delete fighter");
            }
            setFighters(
                fighters.filter((fighter) => fighter.id !== idToDelete)
            );
        });
    }

    return (
        <div className="fighter-library">
            <Navbar 
                isAdmin={isAdmin} 
                unlockAdmin={unlockAdmin}
                lockAdmin={lockAdmin} 
            />
            <h1>Fighters</h1>

            <div className="fighter-filter-controls">
                <select 
                    className="select-weight-class-button" 
                    value={selectedWeightClass}
                    onChange={(e) => setSelectedWeightClass(e.target.value)}
                >
                    {weightClasses.map((weightClass) => (
                        <option
                            key={weightClass} 
                            value={weightClass}>
                                {weightClass}
                        </option>
                    ))}
                </select>
                <input 
                    type="text"
                    className="fighter-search"
                    placeholder="Search fighters..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} 
                />
            </div>

            <div className="fighter-list">
                {filteredFighters.map((fighter) => (
                    <FighterCard
                        key={fighter.id}
                        fighter={fighter}
                        isAdmin={isAdmin}
                        deleteFighter={deleteFighter}
                    />
                ))}
            </div>

        </div>
    )
}

export default FighterLibrary;