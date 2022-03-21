const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../services/services.mongo');

const { loadPlanetsData } = require('../../models/planets.model');

describe('Test suite: Launches API', () => {

    beforeAll(async () => {
        await mongoConnect();
        await loadPlanetsData();
    });

    afterAll(async () => {
        await mongoDisconnect();
        console.log('disconnected');
    });

    describe('Test GET /launches', () => {
        test('It should respond with 200 success', async () => {
            const response = await request(app)
                .get('/v1/launches')
                .expect(200);
            // .expect('Content-Type', /json/);
            // expect(response.statusCode).toBe(200);
        });
        test('It should respond with json format', async () => {
            const response = await request(app)
                .get('/v1/launches')
                .expect('Content-Type', /json/);
        });
    });

    describe('Test POST /launches', () => {
        const completeLaunchData = {
            mission: 'USS Enterprise',
            rocket: 'NCC 1701-D',
            target: 'Kepler-442 b',
            launchDate: 'December 13, 2030'
        };

        const launchDataWithoutDate = {
            mission: 'USS Enterprise',
            rocket: 'NCC 1701-D',
            target: 'Kepler-442 b'
        };

        const completeLaunchDataWithInvalidDate = {
            mission: 'USS Enterprise',
            rocket: 'NCC 1701-D',
            target: 'Kepler-442 b',
            launchDate: 'zoot'
        };

        test('It should respond with 201 success', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(completeLaunchData)
                .expect(201);
        });

        test('It should respond with json format', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(completeLaunchData)
                .expect('Content-Type', /json/);
        });

        test('It should respond with new created launch object', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(completeLaunchData);

            const requestDate = new Date(completeLaunchData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();

            expect(responseDate).toBe(requestDate);
            expect(response.body).toMatchObject(launchDataWithoutDate);
        });

        test('It should catch missing required properties', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(launchDataWithoutDate)
                .expect(400);

            expect(response.body).toStrictEqual({
                error: 'Missing required launch property'
            });
        });

        test('It should catch invalid dates', async () => {
            const response = await request(app)
            .post('/v1/launches')
            .send(completeLaunchDataWithInvalidDate)
            .expect(400);

            expect(response.body).toStrictEqual({
                    error: 'Invalid launch date'
                });
            });
    });

});