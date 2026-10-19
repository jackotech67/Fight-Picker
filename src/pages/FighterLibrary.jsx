import Navbar from "../components/Navbar";
import FighterCard from "../components/FighterCard";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

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
    const [searchParams, setSearchParams] = useSearchParams();

    const selectedWeightClass = searchParams.get("weightClass") || "Lightweight";
    const searchTerm = searchParams.get("search") || "";

    function setSelectedWeightClass(weightClass) {
        setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            params.set("weightClass", weightClass);
            return params;
        });
    }

    function setSearchTerm(search) {
        setSearchParams(prev => {
            const params = new URLSearchParams(prev);

            if (search) {
                params.set("search", search);
            }
            else {
                params.delete("search");
            }

            return params;
        }, { replace: true });
    }

    const [debouncedSearch, setDebouncedSearch] = useState("");

    // wait 300ms after typing
    useEffect(() => { 
        const timeout = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchTerm]);

    // fetch fighters
    useEffect(() => {
        const controller = new AbortController();
        const params = new URLSearchParams();

        if (debouncedSearch.trim()) {
            params.set("search", debouncedSearch.trim());
        } 
        else {
            params.set("weightClass", selectedWeightClass);
        }

        fetch(`${API_URL}/fighters?${params.toString()}`, {
            signal: controller.signal
        })
            .then((response) => response.json())
            .then((data) => setFighters(data))
            .catch((error) => {
                if (error.name !== "AbortError") {
                    console.error("Failed to fetch fighters:", error);
                }
            });

        return () => controller.abort();
    }, [selectedWeightClass, debouncedSearch]);

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
                {fighters.map((fighter) => (
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