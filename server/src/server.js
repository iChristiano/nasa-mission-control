const http = require('http');

require('dotenv').config();

const app = require('./app.js')
const { mongoConnect } = require('./services/services.mongo');
const { loadPlanetsData } = require('./models/planets.model');
const { loadLaunchData } = require('./models/launches.model');

const PORT = process.env.PORT || 3001;

const server = http.createServer(app);

async function startServer() {
    await mongoConnect();
    // wait for inital loaded data
    await loadPlanetsData();
    await loadLaunchData();

    server.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    });
}

startServer();
console.log(`Starting server...`);



