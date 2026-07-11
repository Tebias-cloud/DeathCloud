const request = require('supertest');
const app = require('../server'); // Asumiendo que exportamos app en server.js
const pool = require('../config/db');

describe('Auth Endpoints', () => {
    let testUserId;

    beforeAll(async () => {
        // Limpiar base de datos de test si es necesario
        await pool.query('DELETE FROM usuarios WHERE email = $1', ['test@jest.com']);
    });

    afterAll(async () => {
        // Limpiar después de los tests
        await pool.query('DELETE FROM usuarios WHERE email = $1', ['test@jest.com']);
        await pool.end();
    });

    it('Debería registrar un usuario nuevo', async () => {
        const res = await request(app)
            .post('/api/register')
            .send({
                username: 'JestTestUser',
                email: 'test@jest.com',
                password: 'password123'
            });
        
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('user');
        expect(res.body.user).toHaveProperty('id');
        testUserId = res.body.user.id;
    });

    it('No debería registrar un usuario con email duplicado', async () => {
        const res = await request(app)
            .post('/api/register')
            .send({
                username: 'JestTestUser2',
                email: 'test@jest.com', // Mismo email
                password: 'password123'
            });
        
        expect(res.statusCode).toEqual(400);
        expect(res.body.success).toEqual(false);
    });

    it('Debería iniciar sesión correctamente', async () => {
        const res = await request(app)
            .post('/api/login')
            .send({
                email: 'test@jest.com',
                password: 'password123'
            });
        
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('token');
    });

    it('No debería iniciar sesión con contraseña incorrecta', async () => {
        const res = await request(app)
            .post('/api/login')
            .send({
                email: 'test@jest.com',
                password: 'wrongpassword'
            });
        
        expect(res.statusCode).toEqual(400);
        expect(res.body.success).toEqual(false);
    });
});
