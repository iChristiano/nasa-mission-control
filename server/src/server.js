const http = require('http');
const app = require('./app.js')
const { loadPlanetsData } = require('./models/planets.model');

const PORT = process.env.PORT || 3001;

const server = http.createServer(app);

async function startServer() {
    // wait for inital loaded data
    await loadPlanetsData();
    server.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    });
}

startServer();
console.log(`Starting server...`);



