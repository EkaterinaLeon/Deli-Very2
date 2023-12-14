import * as request from 'supertest';
import * as jsownwebtoken from 'jsonwebtoken';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mainConfig } from '../main.config';
import { AppModule } from '../app.module';

describe('auth-codes', () => {
    let app: INestApplication;
    let configService: ConfigService;
    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();

        app = moduleRef.createNestApplication();
        configService = await moduleRef.resolve(ConfigService);
        mainConfig(app);
        await app.init();
    });

    it(`[POST]`, async () => {
        await request(app.getHttpServer()).post('/auth-codes').expect(400);
        await request(app.getHttpServer()).post('/auth-codes').send({ phoneNumber: 'ABC' }).expect(400);
        await request(app.getHttpServer()).post('/auth-codes').send({ phoneNumber: '780000000' }).expect(400);
        const { status, body } = await request(app.getHttpServer())
            .post('/auth-codes')
            .send({ phoneNumber: '+79780000000' });
        expect(status).toBe(201);
        expect(body).toEqual({ code: expect.any(Number) });
    });

    it(`[POST] /confirm`, async () => {
        const phoneNumber = '+79780000000';
        const {
            body: { code }
        } = await request(app.getHttpServer()).post('/auth-codes').send({ phoneNumber });

        await request(app.getHttpServer())
            .put('/auth-codes/confirm')
            .send({
                phoneNumber,
                code: 10
            })
            .expect(400);

        await request(app.getHttpServer())
            .put('/auth-codes/confirm')
            .send({
                phoneNumber,
                code: code === 9999 ? code - 1 : code + 1,
                userRole: 'restaurant'
            })
            .expect(404);

        const { body } = await request(app.getHttpServer())
            .put('/auth-codes/confirm')
            .send({ phoneNumber, code, userRole: 'restaurant' })
            .expect(200);
        expect(body).toMatchObject({
            secret: expect.any(String)
        });
    });

    it(`[POST] /register`, async () => {
        const phoneNumber = '+79780000000';
        const password = '$ecretPa$$w0rd';
        let {
            body: { code }
        } = await request(app.getHttpServer()).post('/auth-codes').send({ phoneNumber });

        const {
            body: { secret }
        } = await request(app.getHttpServer())
            .put('/auth-codes/confirm')
            .send({ phoneNumber, code, userRole: 'restaurant' })
            .expect(200);

        const {
            body: { token }
        } = await request(app.getHttpServer())
            .put('/auth-codes/register')
            .send({ phoneNumber, password, secret, userRole: 'restaurant' })
            .expect(200);

        const decodedToken = jsownwebtoken.decode(token, configService.getOrThrow('JWT_SECRET'));
        expect(decodedToken).toMatchObject({
            role: 'restaurant',
            id: expect.any(Number),
            iat: expect.any(Number)
        });
        // еще раз, но уже с созданным рестораном
        ({
            body: { code }
        } = await request(app.getHttpServer()).post('/auth-codes').send({ phoneNumber }));
        const { body: userData } = await request(app.getHttpServer())
            .put('/auth-codes/confirm')
            .send({ phoneNumber, code, userRole: 'restaurant' })
            .expect(200);
        expect(userData).toMatchObject({
            user: {
                id: (decodedToken as any).id,
                phoneNumber
            },
            userRole: 'restaurant'
        });
    });
    afterEach(async () => {
        await app.close();
    });
});
