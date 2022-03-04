// # data access layer
const launches = new Map();
const INITIAL_FLIGHT_NUMBER = 100;

let latestFlightNumber = INITIAL_FLIGHT_NUMBER;

const launch = {
    flightNumber: INITIAL_FLIGHT_NUMBER,
    mission: 'Kepler Exploration X',
    rocket: 'Explorer IS1',
    launchDate: new Date('December 27, 2030'),
    target: 'Kepler-442 b',
    customers: ['NASA', 'ABB'],
    upcoming: true,
    success: true,
};

launches.set(launch.flightNumber, launch);

function getAllLaunches() {
    return Array.from(launches.values());
}

function existsLunchWithId(launchId) {
    return launches.has(launchId);
}

function addNewLaunch(launch) {
    latestFlightNumber += 1;
    const newLaunch = Object.assign(launch, {
        flightNumber: latestFlightNumber,
        customers: ['NASA', 'ABB'],
        upcoming: true,
        success: true,
    });
    launches.set(latestFlightNumber, newLaunch);
}

function abortLunchById(launchId) {
    const aborted = launches.get(launchId);
    aborted.upcoming = false;
    aborted.success = false;
    return aborted;
}

module.exports = {
    existsLunchWithId,
    getAllLaunches,
    addNewLaunch,
    abortLunchById
};