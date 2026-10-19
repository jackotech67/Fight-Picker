import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FighterForm from "../components/FighterForm";

const API_URL = import.meta.env.VITE_API_URL;

function FighterFormPage() {

    const { id: fighterId } = useParams();

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

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [submissionWins, setSubmissionWins] = useState("");
    const [knockoutWins, setKnockoutWins] = useState("");
    const [decisionWins, setDecisionWins] = useState("");
    const [divisionRank, setDivisionRank] = useState("");

    const [weightClass, setWeightClass] = useState("");
    const [country, setCountry] = useState("");

    const [height, setHeight] = useState("");
    const [reach, setReach] = useState("");
    const [stance, setStance] = useState("");
    const [age, setAge] = useState("");

    const [careerWins, setCareerWins] = useState("");
    const [careerLosses, setCareerLosses] = useState("");
    const [careerDraws, setCareerDraws] = useState("");
    const [careerNoContests, setCareerNoContests] = useState("");

    const [strikesPerMin, setStrikesPerMin] = useState("");
    const [strikingAccuracy, setStrikingAccuracy] = useState("");
    const [strikesAbsorbedPerMin, setStrikesAbsorbedPerMin] = useState("");
    const [strikingDefence, setStrikingDefence] = useState("");
    const [takedownsPer15Min, setTakedownsPer15Min] = useState("");
    const [takedownAccuracy, setTakedownAccuracy] = useState("");
    const [takedownDefence, setTakedownDefence] = useState("");
    const [submissionsPer15Min, setSubmissionsPer15Min] = useState("");

    const navigate = useNavigate();

    useEffect(() => {

        fetch(`${API_URL}/fighters/${fighterId}`)
            .then((response) => response.json())
            .then((fighter) => { 

                setFirstName(fighter.firstName);
                setLastName(fighter.lastName);
                setDivisionRank(
                    fighter.championStatus === "champion"
                    ? "C"
                    : fighter.divisionRank != null
                    ? String(fighter.divisionRank)
                    : "NR"
                );
                setWeightClass(fighter.weightClass);
                setCountry(fighter.country || "");

                setSubmissionWins(fighter.submissionWins);
                setKnockoutWins(fighter.knockoutWins);
                setDecisionWins(fighter.decisionWins);

                setHeight(fighter.height);
                setReach(fighter.reach);
                setStance(fighter.stance);
                setAge(fighter.age);

                setCareerWins(fighter.careerWins);
                setCareerLosses(fighter.careerLosses);
                setCareerDraws(fighter.careerDraws);
                setCareerNoContests(fighter.careerNoContests);

                setStrikesPerMin(fighter.strikesPerMin);
                setStrikingAccuracy(fighter.strikingAccuracy);
                setStrikesAbsorbedPerMin(fighter.strikesAbsorbedPerMin);
                setStrikingDefence(fighter.strikingDefence);
                setTakedownsPer15Min(fighter.takedownsPer15Min);
                setTakedownAccuracy(fighter.takedownAccuracy);
                setTakedownDefence(fighter.takedownDefence);
                setSubmissionsPer15Min(fighter.submissionsPer15Min);
            });
    }, [fighterId]);

    function saveFighter() {

        if (firstName.trim() === "" || lastName.trim() === "") {
            alert("Please enter a first and last name");
        return;
        }
        if (weightClass === "") {
            alert("Please select a weight class");
        return;
        }
        if (submissionWins < 0 || knockoutWins < 0 || decisionWins < 0){
            alert("Stats cannot be negative");
        return;
        }

        const rankInput = String(divisionRank).trim().toUpperCase();

        if (!["C", "NR", ""].includes(rankInput) &&
            !/^(?:[1-9]|1[0-5])$/.test(rankInput)) {
            alert("Rank must be C, NR, or a number from 1 to 15");
            return;
        }

        const championStatus = rankInput === "C" ? "champion" : null;
        const numericRank = /^[0-9]+$/.test(rankInput)
            ? Number(rankInput)
            : null;
        
        const toNumberOrNull = (value) =>
            value === "" || value == null ? null : Number(value);

        fetch(`${API_URL}/fighters/${fighterId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${sessionStorage.getItem("adminToken")}`
            },
            body: JSON.stringify({
                firstName,
                lastName,
                divisionRank: numericRank,
                championStatus,
                weightClass,
                country,
                submissionWins: toNumberOrNull(submissionWins),
                knockoutWins: toNumberOrNull(knockoutWins),
                decisionWins: toNumberOrNull(decisionWins),
                height: toNumberOrNull(height),
                reach: toNumberOrNull(reach),
                stance,
                age: toNumberOrNull(age),
                careerWins: toNumberOrNull(careerWins),
                careerLosses: toNumberOrNull(careerLosses),
                careerDraws: toNumberOrNull(careerDraws),
                careerNoContests: toNumberOrNull(careerNoContests),
                strikesPerMin: toNumberOrNull(strikesPerMin),
                strikingAccuracy: toNumberOrNull(strikingAccuracy),
                strikesAbsorbedPerMin: toNumberOrNull(strikesAbsorbedPerMin),
                strikingDefence: toNumberOrNull(strikingDefence),
                takedownsPer15Min: toNumberOrNull(takedownsPer15Min),
                takedownAccuracy: toNumberOrNull(takedownAccuracy),
                takedownDefence: toNumberOrNull(takedownDefence),
                submissionsPer15Min: toNumberOrNull(submissionsPer15Min)
            }),
        })
        .then((response) => {
            console.log(response.status);
            return response.json();
        })
        .then((data) => {
            console.log(data);
            navigate(`/fighter/${fighterId}`);
        });
    }

    const token = sessionStorage.getItem("adminToken");

    if (!token) {
        return <p>Admin access required.</p>
    }

    return (
        <div className="add-fighter-wrapper">
            <h1>Edit Fighter</h1>
            <FighterForm
                firstName={firstName}
                setFirstName={setFirstName}
                lastName={lastName}
                setLastName={setLastName}
                divisionRank={divisionRank}
                setDivisionRank={setDivisionRank}
                weightClass={weightClass}
                setWeightClass={setWeightClass}
                weightClasses={weightClasses}
                country={country}
                setCountry={setCountry}
                submissionWins={submissionWins}
                setSubmissionWins={setSubmissionWins}
                knockoutWins={knockoutWins}
                setKnockoutWins={setKnockoutWins}
                decisionWins={decisionWins}
                setDecisionWins={setDecisionWins}
                saveFighter={saveFighter}
                height={height}
                setHeight={setHeight}
                reach={reach}
                setReach={setReach}
                stance={stance}
                setStance={setStance}
                age={age}
                setAge={setAge}
                careerWins={careerWins}
                setCareerWins={setCareerWins}
                careerLosses={careerLosses}
                setCareerLosses={setCareerLosses}
                careerDraws={careerDraws}
                setCareerDraws={setCareerDraws}
                careerNoContests={careerNoContests}
                setCareerNoContests={setCareerNoContests}
                strikesPerMin={strikesPerMin}
                setStrikesPerMin={setStrikesPerMin}
                strikingAccuracy={strikingAccuracy}
                setStrikingAccuracy={setStrikingAccuracy}
                strikesAbsorbedPerMin={strikesAbsorbedPerMin}
                setStrikesAbsorbedPerMin={setStrikesAbsorbedPerMin}
                strikingDefence={strikingDefence}
                setStrikingDefence={setStrikingDefence}
                takedownsPer15Min={takedownsPer15Min}
                setTakedownsPer15Min={setTakedownsPer15Min}
                takedownAccuracy={takedownAccuracy}
                setTakedownAccuracy={setTakedownAccuracy}
                takedownDefence={takedownDefence}
                setTakedownDefence={setTakedownDefence}
                submissionsPer15Min={submissionsPer15Min}
                setSubmissionsPer15Min={setSubmissionsPer15Min}
            />
        </div>
    )
}

export default FighterFormPage;