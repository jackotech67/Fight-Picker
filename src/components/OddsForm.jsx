const API_URL = import.meta.env.VITE_API_URL;

function OddsForm({ event, onClose, odds }) {

    async function saveOdds() {
        const token = sessionStorage.getItem("adminToken");

        try {
            const requests = [];

            for (const bout of event.bouts) {
                for (const fighter of bout.fighters) {
                    const value = odds[`${bout.id}-${fighter.id}`];

                    if (value === undefined || value === "") continue;

                    const decimalOdds = Number(value);

                    if (!Number.isFinite(decimalOdds) || decimalOdds <= 1 || decimalOdds > 99999.99) {
                        alert(`Invalid odds for ${fighter.firstName} ${fighter.lastName}`);
                        return;
                    }

                    requests.push({
                        boutId: bout.id,
                        fighterId: fighter.id,
                        decimalOdds
                    });
                }
            }

            await Promise.all(requests.map(async ({ boutId, fighterId, decimalOdds }) => {
                const response = await fetch(`${API_URL}/bouts/${boutId}/odds`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        fighterId,
                        bookmaker: "TAB NZ",
                        decimalOdds
                    })
                });

                if (!response.ok) {
                    throw new Error("Failed to save odds");
                }
            }));

            alert("Odds saved successfully!");
            onClose();

        } catch (error) {
            console.error(error);
            alert("Failed to save some odds");
        }
    }

    return (
        <div className="odds-form">
            <button type="button" onClick={saveOdds}>Save All</button>
            <button type="button" onClick={onClose}>Cancel</button>
        </div>
    );
}

export default OddsForm;