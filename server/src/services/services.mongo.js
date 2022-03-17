const mongoose = require('mongoose');

require('dotenv').config();

const MONGO_URL = process.env.MONGU_URL;

mongoose.connection.once('open', () => {
    console.log('MongoDB connection ready!');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection err!', err);
});

mongoose.connection.on('close', () => {
    console.log('MongoDB connection closed!');
});

async function mongoConnect() {
    await mongoose.connect(MONGO_URL);
}

async function mongoDisconnect() {
    await mongoose.disconnect();
}

module.exports = {
    mongoConnect,
    mongoDisconnect
}