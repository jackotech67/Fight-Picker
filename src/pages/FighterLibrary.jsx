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
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const selectedWeightClass = searchParams.get("weightClass") || "Lightweight";
    const searchTerm = searchParams.get("search") || "";

    function setSelectedWeightClass(weightClass) {
        setPage(1);
        setFighters([]);
        setHasMore(true);
        setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            params.set("weightClass", weightClass);
            return params;
        });
    }

    function setSearchTerm(search) {
        setPage(1);
        setFighters([]);
        setHasMore(true);
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
        if (searchTerm !== debouncedSearch) {
            return () => controller.abort();
        }
        const params = new URLSearchParams();

        if (debouncedSearch.trim()) {
            params.set("search", debouncedSearch.trim());
        }
        else {
            params.set("weightClass", selectedWeightClass);
        }

        params.set("page", page);
        setLoading(true);

        fetch(`${API_URL}/fighters?${params.toString()}`, {
            signal: controller.signal
        })
            .then((response) => {
                if (!response.ok) throw new Error("Failed to fetch fighters");
                return response.json();
            })
            .then((data) => {
                setFighters((previous) => 
                    page === 1 ? data : [...previous, ...data]
                );
                setHasMore(data.length === 12);
            })
            .catch((error) => {
                if (error.name !== "AbortError") {
                    console.error("Failed to fetch fighters", error);
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });
            return () => controller.abort();
    }, [selectedWeightClass, searchTerm, debouncedSearch, page]);

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

            {hasMore && (
                <button
                    className="load-more-button"
                    onClick={() => setPage((previous) => previous + 1)}
                    disabled={loading || searchTerm !== debouncedSearch}
                >
                    {loading ? "Loading..." : "Load More"}
                </button>
            )}

        </div>
    )
}

export default FighterLibrary;