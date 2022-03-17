// # data access layer
const axios = require('axios');
const launchesDB = require('./launches.mongo.js');
const planetsDB = require('./planets.mongo.js')

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches() {
    console.log('Downloading SpaceX data ...');
    const queryOptions = {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        customers: 1
                    }
                }
            ]
        }
    };
    const response = await axios.post(SPACEX_API_URL, queryOptions);
    if (response.status !== 200) {
        console.log('Problem downloading launch data');
        throw new Error('Lauch data download fail');
    }
    
    const launchDocs = response.data.docs;
    for (const launchDoc of launchDocs) {
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload) => {
            return payload['customers'];
        });

        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers: customers
        };

        console.log(`${launch.flightNumber} ${launch.mission}`);
        await saveLaunch(launch);
    }
}

// TODO needs periodic update may serverless ...
async function loadLaunchData() {
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
    });
    if (firstLaunch) {
        console.log('Launch data already loaded!');
    } else {
        await populateLaunches();
    }
}

async function findLaunch(filter) {
    return await launchesDB.findOne(filter);
}

async function existsLunchWithId(launchId) {
    return await findLaunch({
        flightNumber: launchId
    });
}

async function getLatestFlightNumber() {
    const latestLaunch = await launchesDB
        .findOne({})
        .sort('-flightNumber');

    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER;
    }
    return latestLaunch.flightNumber;
}

async function saveLaunch(launch) {
    try {
        await launchesDB.findOneAndUpdate({
            flightNumber: launch.flightNumber,
        }, 
        launch, {
            upsert: true
        });
    } catch (error) {
        console.error('Could not save launch: ', error);
    }
}

async function getAllLaunches(skip, limit) {
    return await launchesDB
        .find({}, {
            '_id': 0,
            '__v': 0
        })
        .sort({
            flightNumber: 1
        })
        .skip(skip)
        .limit(limit);
}

async function scheduleNewLaunch(launch) {
    try {
        const planet = await planetsDB.findOne({
            keplerName: launch.target
        });
        if (!planet) {
            throw new Error('No matching planet was found.')
        }
    } catch (error) {
        console.error('Could not schedule new launch: ', error);
    }
    
    const newFlightNumber = await getLatestFlightNumber() +1;
    const newLauch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ['NASA', 'ABB'],
        flightNumber: newFlightNumber,
    });
    await saveLaunch(newLauch);
}

async function abortLunchById(launchId) {
    const aborted = await launchesDB.updateOne({
        flightNumber: launchId
    }, {
        upcoming: false,
        success: false
    });
    return aborted.modifiedCount === 1;
}

module.exports = {
    loadLaunchData,
    existsLunchWithId,
    getAllLaunches,
    scheduleNewLaunch,
    abortLunchById
};