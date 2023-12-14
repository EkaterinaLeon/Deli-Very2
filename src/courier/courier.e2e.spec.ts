import * as request from 'supertest';
import * as jsownwebtoken from 'jsonwebtoken';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mainConfig } from '../main.config';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { UpdateCourierDto } from './dto/update-courier.dto';
import { Courier } from './entities/courier.entity';

/**
 * Создает курьера и возвращает токен
 * @param app
 * @param phoneNumber
 * @param password
 */
export async function createCourier(app: INestApplication, phoneNumber: string, password: string) {
    const {
        body: { code }
    } = await request(app.getHttpServer()).post('/auth-codes').send({ phoneNumber }).expect(201);
    expect(code).toEqual(expect.any(Number));
    const { body } = await request(app.getHttpServer())
        .put('/auth-codes/confirm')
        .send({ phoneNumber, code, userRole: 'courier' })
        .expect(200);
    const {
        body: { token }
    } = await request(app.getHttpServer())
        .put('/auth-codes/register')
        .send({ phoneNumber, password, secret: body.secret, userRole: 'courier' })
        .expect(200);
    return token;
}

/**
 * Обновляет курьера
 * @param app
 * @param token
 * @param updateData
 */
export async function updateCourier(app: INestApplication, token: string, updateData: UpdateCourierDto) {
    const { status } = await request(app.getHttpServer())
        .put('/couriers')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);
    expect(status).toEqual(200);
}
describe('couriers', () => {
    let app: INestApplication;
    let configService: ConfigService;
    let connection: DataSource;
    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();

        app = moduleRef.createNestApplication();
        connection = await moduleRef.resolve(DataSource);
        configService = await moduleRef.resolve(ConfigService);
        mainConfig(app);
        await app.init();
    });

    it(`[POST] /login`, async () => {
        const phoneNumber = '+79780000000';
        const password = '$ecretPa$$w0rd';
        const token = await createCourier(app, phoneNumber, password);
        const decodedToken = jsownwebtoken.decode(token, configService.getOrThrow('JWT_SECRET'));
        expect(decodedToken).toMatchObject({
            role: 'courier',
            id: expect.any(Number),
            iat: expect.any(Number)
        });
        // логинимся
        const {
            body: { token: loginToken }
        } = await request(app.getHttpServer()).post('/couriers/login').send({ phoneNumber, password }).expect(201);
        expect(loginToken).toEqual(token);
    });

    it(`[PUT] /`, async () => {
        const phoneNumber = '+79780000001';
        const password = '$ecretPa$$w0rd';
        const token = await createCourier(app, phoneNumber, password);
        await updateCourier(app, token, { firstName: 'firstName1', middleName: 'middleName1' });
        let courier = await connection.manager.findOne(Courier, { where: { phoneNumber } });
        expect(courier).toMatchObject({
            phoneNumber,
            firstName: 'firstName1',
            middleName: 'middleName1'
        });
        await updateCourier(app, token, {
            firstName: 'firstName1_updated',
            middleName: 'middleName1',
            email: 'email1@email.com'
        });
        courier = await connection.manager.findOne(Courier, { where: { phoneNumber } });
        expect(courier).toMatchObject({
            phoneNumber,
            firstName: 'firstName1_updated',
            middleName: 'middleName1',
            email: 'email1@email.com'
        });
        await updateCourier(app, token, { bankCard: { cardNumber: '1234567890123457', expireAt: '12/24' } });
        courier = await connection.manager.findOne(Courier, { where: { phoneNumber }, relations: ['bankCard'] });
        expect(courier).toMatchObject({
            phoneNumber,
            firstName: 'firstName1_updated',
            middleName: 'middleName1',
            email: 'email1@email.com'
        });
        expect(courier.bankCard).toMatchObject({
            id: courier.bankCardId,
            cardNumber: '1234567890123457',
            expireAt: '12/24'
        });
        await updateCourier(app, token, { bankCard: { cardNumber: '1234567890123458', expireAt: '12/25' } });
        courier = await connection.manager.findOne(Courier, { where: { phoneNumber }, relations: ['bankCard'] });
        expect(courier.bankCard).toMatchObject({
            id: courier.bankCardId,
            cardNumber: '1234567890123458',
            expireAt: '12/25'
        });
    });
    afterEach(async () => {
        await app.close();
    });
});
