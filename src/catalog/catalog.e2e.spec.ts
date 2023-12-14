import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { mainConfig } from '../main.config';
import { AppModule } from '../app.module';
import { createRestaurant } from '../restaurants/restaurants.e2e.spec';
import { CreateCatalogItemDto } from './dto/create-catalog-item.dto';
import { CatalogItem } from './entities/catalog-item.entity';
import { UpdateCatalogItemDto } from './dto/update-catalog-item.dto';

export async function createCatalogItem(
    app: INestApplication,
    token: string,
    createCatalogItemDto: CreateCatalogItemDto
) {
    const { body, status } = await request(app.getHttpServer())
        .post('/catalog')
        .set('Authorization', `Bearer ${token}`)
        .send(createCatalogItemDto);
    expect(status).toBe(201);
    return body as CatalogItem;
}

export async function getCatalogItems(app: INestApplication, token: string) {
    const { status, body } = await request(app.getHttpServer()).get('/catalog').set('Authorization', `Bearer ${token}`);
    expect(status).toBe(200);
    return body as CatalogItem[];
}

export async function getCatalogItem(app: INestApplication, token: string, itemId: number) {
    const { status, body } = await request(app.getHttpServer())
        .get(`/catalog/${itemId}`)
        .set('Authorization', `Bearer ${token}`);
    expect(status).toBe(200);
    return body as CatalogItem[];
}

export async function updateCatalogItem(
    app: INestApplication,
    token: string,
    itemId: number,
    updateData: UpdateCatalogItemDto
) {
    const { status } = await request(app.getHttpServer())
        .patch(`/catalog/${itemId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);
    expect(status).toBe(200);
}

async function deleteCatalogItem(app: INestApplication, token: string, itemId: number) {
    const { status } = await request(app.getHttpServer())
        .delete(`/catalog/${itemId}`)
        .set('Authorization', `Bearer ${token}`);
    expect(status).toBe(200);
}
describe('catalog', () => {
    let app: INestApplication;
    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();

        app = moduleRef.createNestApplication();
        mainConfig(app);
        await app.init();
    });
    // создаем пунты каталога
    it(`[POST] /`, async () => {
        const phoneNumber = '+79780000003';
        const password = '$ecretPa$$w0rd';
        const token = await createRestaurant(app, phoneNumber, password);
        const item1 = await createCatalogItem(app, token, {
            name: 'Картофель фри',
            description: 'Картофель фри с соусом',
            price: 100.12
        });
        expect(item1).toMatchObject({
            id: expect.any(Number),
            name: 'Картофель фри',
            description: 'Картофель фри с соусом',
            price: 100.12
        });
        const item2 = await createCatalogItem(app, token, {
            name: 'Гамбургер',
            description: 'Гамбургер с сыром',
            price: 200.12
        });
        expect(item2).toMatchObject({
            id: expect.any(Number),
            name: 'Гамбургер',
            description: 'Гамбургер с сыром',
            price: 200.12
        });
        const item3 = await createCatalogItem(app, token, {
            name: 'Гамбургер',
            description: 'Гамбургер с сыром и салатом',
            price: 200.12
        });
        expect(item3).toMatchObject({
            id: expect.any(Number),
            name: 'Гамбургер',
            description: 'Гамбургер с сыром и салатом',
            price: 200.12
        });
    });
    // получаем пункты каталога для ресторана
    it(`[GET] /`, async () => {
        const phoneNumber = '+79780000003';
        const password = '$ecretPa$$w0rd';
        const token = await createRestaurant(app, phoneNumber, password);
        await createCatalogItem(app, token, {
            name: 'Картофель фри',
            description: 'Картофель фри с соусом',
            price: 100.12
        });
        await createCatalogItem(app, token, {
            name: 'Гамбургер',
            description: 'Гамбургер с сыром',
            price: 200.12
        });
        const restaurantCatalogItems = await getCatalogItems(app, token);
        expect(restaurantCatalogItems).toMatchObject([
            {
                id: expect.any(Number),
                name: 'Картофель фри',
                description: 'Картофель фри с соусом',
                price: 100.12
            },
            {
                id: expect.any(Number),
                name: 'Гамбургер',
                description: 'Гамбургер с сыром',
                price: 200.12
            }
        ]);
    });
    // получаем отдельный пункт каталога для ресторана
    it(`[GET] /:id`, async () => {
        const phoneNumber = '+79780000003';
        const password = '$ecretPa$$w0rd';
        const token = await createRestaurant(app, phoneNumber, password);
        const { id: itemId } = await createCatalogItem(app, token, {
            name: 'Гамбургер',
            description: 'Гамбургер с сыром',
            price: 200.12
        });
        const searchedItem = await getCatalogItem(app, token, itemId);
        expect(searchedItem).toMatchObject({
            id: expect.any(Number),
            name: 'Гамбургер',
            description: 'Гамбургер с сыром',
            price: 200.12
        });
    });
    // редактирование отдельного пункта каталога ресторана
    it(`[PATCH] /:id`, async () => {
        const phoneNumber = '+79780000003';
        const password = '$ecretPa$$w0rd';
        const token = await createRestaurant(app, phoneNumber, password);
        const { id: itemId } = await createCatalogItem(app, token, {
            name: 'Гамбургер',
            description: 'Гамбургер с сыром',
            price: 200.12
        });
        await updateCatalogItem(app, token, itemId, { price: 300 });
        const searchedItem = await getCatalogItem(app, token, itemId);
        expect(searchedItem).toMatchObject({
            id: expect.any(Number),
            name: 'Гамбургер',
            description: 'Гамбургер с сыром',
            price: 300
        });
    });
    // удаляем один(по идишнику) пункт каталога ресторана
    it(`[DELETE] /:id`, async () => {
        const phoneNumber = '+79780000003';
        const password = '$ecretPa$$w0rd';
        const token = await createRestaurant(app, phoneNumber, password);
        await createCatalogItem(app, token, {
            name: 'Картофель фри',
            description: 'Картофель фри с соусом',
            price: 100.12
        });
        await createCatalogItem(app, token, {
            name: 'Гамбургер',
            description: 'Гамбургер с сыром',
            price: 200.12
        });
        let restaurantCatalogItems = await getCatalogItems(app, token);
        expect(restaurantCatalogItems).toMatchObject([
            {
                id: expect.any(Number),
                name: 'Картофель фри',
                description: 'Картофель фри с соусом',
                price: 100.12
            },
            {
                id: expect.any(Number),
                name: 'Гамбургер',
                description: 'Гамбургер с сыром',
                price: 200.12
            }
        ]);
        await deleteCatalogItem(app, token, restaurantCatalogItems[1].id);
        restaurantCatalogItems = await getCatalogItems(app, token);
        expect(restaurantCatalogItems).toMatchObject([
            {
                id: expect.any(Number),
                name: 'Картофель фри',
                description: 'Картофель фри с соусом',
                price: 100.12
            }
        ]);
    });
    afterEach(async () => {
        await app.close();
    });
});
