// # data access layer
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');

const planetsDB = require('./planets.mongo.js')

// https://www.centauri-dreams.org/2015/01/30/a-review-of-the-best-habitable-planet-candidates/

// Exoplanet Archive Disposition -> exoplanet state of analysis -> "CANDIDATE", "FALSE POSITIVE" OR "CONFIRMED"
const exoplanetArchiveDisposition = {
    id: 'koi_disposition',
    value: 'CONFIRMED'
};

// Insolation Flux -> amount of sun/energy
const insolationFlux = {
    id: 'koi_insol',
    minValue: 0.36,
    maxValue: 1.11
};

// Planetary Radius
const planetaryRadius = {
    id: 'koi_prad',
    value: 1.6
};

// Equilibrium Temperature -> between 175K (-98,15°C)and 270K (-3,15°C) -> according to a study done by Kaltenegger and Sasselov
const equilibriumTemperature = {
    id: 'koi_teq',
    minValue: 175,
    maxValue: 270
};

function isHabitablePlanet(planet) {
    return planet[exoplanetArchiveDisposition.id] === exoplanetArchiveDisposition.value
        && planet[insolationFlux.id] > insolationFlux.minValue 
        && planet[insolationFlux.id] < insolationFlux.maxValue
        && planet[planetaryRadius.id] < planetaryRadius.value
        && planet[equilibriumTemperature.id] > equilibriumTemperature.minValue 
        && planet[equilibriumTemperature.id] < equilibriumTemperature.maxValue;
}

function loadPlanetsData() {
    // read in data in a stream and pipe it to parser
    return new Promise( (resolve, reject) => { 
        fs.createReadStream(path.join(__dirname,'..', '..', 'data','kepler_data.csv'))
            .pipe(parse({
                comment: '#',
                columns: true 
            }))
            .on('data', async (data) => {
                if (isHabitablePlanet(data)) {
                    savePlanet(data);
                }
            })
            .on('error', (err) => {
                console.log('error:', err);
                reject(err)
            })
            .on('end', async () => {
                const countPlanetsFound = (await getAllPlanets()).length;
                console.log(`Habitable planet candidates found:`, countPlanetsFound);
                resolve();
            });
    });
}

async function getAllPlanets() {
    return await planetsDB.find({}, {
        '_id': 0,
        '__v': 0
    });
}

async function savePlanet(planet) {
    try {
        await planetsDB.updateOne({
            keplerName: planet.kepler_name
        }, {
            keplerName: planet.kepler_name
        }, {
            upsert: true
        });
    } catch (error) {
        console.error('Could not save planet: ', error);
    }  
}

module.exports = {
    loadPlanetsData,
    getAllPlanets,
};