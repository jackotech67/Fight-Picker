import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddFighterForm from "./AddFighterForm";

function FighterFormPage({ mode, fighterId}) {

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
    const [submissions, setSubmissions] = useState("");
    const [knockouts, setKnockouts] = useState("");
    const [decisions, setDecisions] = useState("");

    const [weightClass, setWeightClass] = useState("");

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
        if (mode !== "edit") return;

        fetch(`http://localhost:3000/fighters/${fighterId}`)
            .then((response) => response.json())
            .then((fighter) => { 

                setFirstName(fighter.firstName);
                setLastName(fighter.lastName);
                setWeightClass(fighter.weightClass);

                setSubmissions(fighter.submissions);
                setKnockouts(fighter.knockouts);
                setDecisions(fighter.decisions);

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
    }, [mode, fighterId]);

    function saveFighter() {

        if (firstName.trim() === "" || lastName.trim() === "") {
            alert("Please enter a first and last name");
        return;
        }
        if (weightClass === "") {
            alert("Please select a weight class");
        return;
        }
        if (submissions < 0 || knockouts < 0 || decisions < 0){
            alert("Stats cannot be negative");
        return;
        }

        const url =
            mode === "edit"
            ? `http://localhost:3000/fighters/${fighterId}`
            : "http://localhost:3000/fighters";
            
        const method = mode === "edit" ? "PUT" : "POST";

        fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                firstName,
                lastName,
                weightClass,
                submissions,
                knockouts,
                decisions,
                height,
                reach,
                stance,
                age, 
                careerWins,
                careerLosses,
                careerDraws,
                careerNoContests,
                strikesPerMin: strikesPerMin === "" ? null : strikesPerMin,
                strikingAccuracy: strikingAccuracy === "" ? null : strikingAccuracy,
                strikesAbsorbedPerMin: strikesAbsorbedPerMin === "" ? null : strikesAbsorbedPerMin,
                strikingDefence: strikingDefence === "" ? null : strikingDefence,
                takedownsPer15Min: takedownsPer15Min === "" ? null : takedownsPer15Min,
                takedownAccuracy: takedownAccuracy === "" ? null : takedownAccuracy,
                takedownDefence: takedownDefence === "" ? null : takedownDefence,
                submissionsPer15Min: submissionsPer15Min === "" ? null : submissionsPer15Min
            }),
        })
        .then((response) => {
            console.log(response.status);
            return response.json();
        })
        .then((data) => {
            console.log(data);
            navigate("/");
        });
    }

    return (
        <div className="add-fighter-wrapper">
            <h1>{mode === "add" ? "Add Fighter" : "Edit Fighter"}</h1>
            
            <AddFighterForm
                firstName={firstName}
                setFirstName={setFirstName}
                lastName={lastName}
                setLastName={setLastName}
                weightClass={weightClass}
                setWeightClass={setWeightClass}
                weightClasses={weightClasses}
                submissions={submissions}
                setSubmissions={setSubmissions}
                knockouts={knockouts}
                setKnockouts={setKnockouts}
                decisions={decisions}
                setDecisions={setDecisions}
                editFighter={saveFighter}
                mode={mode}
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