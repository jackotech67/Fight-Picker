require("dotenv").config();

// HELPER FUNCTIONS
function splitStat(stat) {
    const [landed, attempted] = stat.split(" of ");

    return {
        landed: Number(landed),
        attempted: Number(attempted)
    }
}

function timeToSeconds(time) {
    const [minutes, seconds] = time.split(":");
    return (Number(minutes) * 60) + Number(seconds);
}

async function testCito() {

    const response = await fetch(
        "https://api.citoapi.com/api/v1/ufc/events/completed",
        {
            headers: {
                "X-API-KEY": process.env.CITO_API_KEY
            }
        }
    );

    const result = await response.json();
    const events = result.data;

    const event = events.find(event => event.hasStats === true);

    const boutResponse = await fetch(
        `https://api.citoapi.com/api/v1/ufc/events/${event.slug}/bouts`,
        {
            headers: {
                "X-API-KEY": process.env.CITO_API_KEY
            }
        }
    );

    const boutResult = await boutResponse.json();
    const bouts = boutResult.data;

    const roundStat = bouts[0].roundStats[0];

    const significantStrikes = splitStat(roundStat.significantStrikes);
    const totalStrikes = splitStat(roundStat.totalStrikes);
    const takedowns = splitStat(roundStat.takedowns);
    const head = splitStat(roundStat.head);
    const body = splitStat(roundStat.body);
    const leg = splitStat(roundStat.leg);
    const distance = splitStat(roundStat.distance);
    const clinch = splitStat(roundStat.clinch);
    const ground = splitStat(roundStat.ground);

    console.log({
        fighter: roundStat.fighterName,
        round: roundStat.round,
        significantStrikes,
        totalStrikes,
        takedowns,
        head,
        body,
        leg,
        distance,
        clinch,
        ground,
        controlTime: timeToSeconds(roundStat.controlTime)
    });

}

testCito();