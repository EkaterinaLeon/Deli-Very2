import * as request from 'supertest';
import * as jsownwebtoken from 'jsonwebtoken';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mainConfig } from '../main.config';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

/**
 * Создает ресторан и возвращает токен
 * @param app
 * @param phoneNumber
 * @param password
 */
export async function createRestaurant(app: INestApplication, phoneNumber: string, password: string) {
    const {
        body: { code }
    } = await request(app.getHttpServer()).post('/auth-codes').send({ phoneNumber }).expect(201);
    expect(code).toEqual(expect.any(Number));
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
    return token;
}

/**
 * Обновляет ресторан
 * @param app
 * @param token
 * @param updateData
 */
export async function updateRestaurant(app: INestApplication, token: string, updateData: UpdateRestaurantDto) {
    const { status } = await request(app.getHttpServer())
        .put('/restaurants')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);
    expect(status).toEqual(200);
}
describe('restaurants', () => {
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
        const token = await createRestaurant(app, phoneNumber, password);
        const decodedToken = jsownwebtoken.decode(token, configService.getOrThrow('JWT_SECRET'));
        expect(decodedToken).toMatchObject({
            role: 'restaurant',
            id: expect.any(Number),
            iat: expect.any(Number)
        });
        // логинимся
        const {
            body: { token: loginToken }
        } = await request(app.getHttpServer()).post('/restaurants/login').send({ phoneNumber, password }).expect(201);
        expect(loginToken).toEqual(token);
    });

    it(`[PUT] /`, async () => {
        const phoneNumber = '+79780000001';
        const password = '$ecretPa$$w0rd';
        const token = await createRestaurant(app, phoneNumber, password);
        await updateRestaurant(app, token, { name: 'some_name1' });
        let restaurant = await connection.manager.findOne(Restaurant, { where: { phoneNumber } });
        expect(restaurant).toMatchObject({
            phoneNumber,
            name: 'some_name1'
        });
        await updateRestaurant(app, token, { name: 'some_name2', address: 'address2', email: 'email2@email.com' });
        restaurant = await connection.manager.findOne(Restaurant, { where: { phoneNumber } });
        expect(restaurant).toMatchObject({
            phoneNumber,
            name: 'some_name2',
            address: 'address2',
            email: 'email2@email.com'
        });
        await updateRestaurant(app, token, { bankCard: { cardNumber: '1234567890123457', expireAt: '12/24' } });
        restaurant = await connection.manager.findOne(Restaurant, { where: { phoneNumber }, relations: ['bankCard'] });
        expect(restaurant).toMatchObject({
            phoneNumber,
            name: 'some_name2',
            address: 'address2',
            email: 'email2@email.com',
            bankCardId: expect.any(Number)
        });
        expect(restaurant.bankCard).toMatchObject({
            id: restaurant.bankCardId,
            cardNumber: '1234567890123457',
            expireAt: '12/24'
        });
        await updateRestaurant(app, token, { bankCard: { cardNumber: '1234567890123458', expireAt: '12/25' } });
        restaurant = await connection.manager.findOne(Restaurant, { where: { phoneNumber }, relations: ['bankCard'] });
        expect(restaurant.bankCard).toMatchObject({
            id: restaurant.bankCardId,
            cardNumber: '1234567890123458',
            expireAt: '12/25'
        });
    });
    afterEach(async () => {
        await app.close();
    });
});
