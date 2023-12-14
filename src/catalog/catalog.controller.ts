import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpStatus } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CreateCatalogItemDto } from './dto/create-catalog-item.dto';
import { UpdateCatalogItemDto } from './dto/update-catalog-item.dto';
import { AuthGuard, RestaurantOnly } from '../auth/auth.guard';
import { RestaurantOrCourierId } from '../auth/tokenExtractor';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Блюда и список блюд')
@Controller('catalog')
export class CatalogController {
    constructor(private readonly catalogService: CatalogService) {}

    @ApiOperation({
        summary:
            'Создание или обнволение блюда. Обновится если блюдо с таким наименованием имеется для данного ретсорана'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: `Созданное блюдо, включая модель ресторна которому она принадлежит`,
        schema: {
            example: {
                id: 1,
                name: 'Борщ',
                price: 100,
                description: 'Борщ свекольный',
                createdAt: '2021-08-01T12:00:00.000Z',
                updatedAt: '2021-08-01T12:00:00.000Z',
                restaurant: {
                    id: 1,
                    name: 'Ресторан',
                    address: 'Адрес',
                    phoneNumber: '+79780000000'
                }
            }
        }
    })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Неверно сформированы данные для запроса' })
    @Post() // +
    @RestaurantOnly()
    @UseGuards(AuthGuard)
    async create(@RestaurantOrCourierId() restaurantId: number, @Body() createCatalogItemDto: CreateCatalogItemDto) {
        return this.catalogService.create({ ...createCatalogItemDto, restaurantId });
    }

    @ApiOperation({
        summary: 'Обновление блюда'
    })
    @ApiParam({ name: 'id', required: true, description: 'Идентификатор блюда в ресторане(id)' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Неверно сформированы данные для запроса' })
    @Patch(':id') // +
    @RestaurantOnly()
    @UseGuards(AuthGuard)
    async update(
        @RestaurantOrCourierId() restaurantId: number,
        @Param('id') id: string,
        @Body() updateCatalogItemDto: UpdateCatalogItemDto
    ) {
        return this.catalogService.update(+id, { ...updateCatalogItemDto, restaurantId });
    }
    @ApiOperation({
        summary: 'Получение списка всех блюд ресторана'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: `Полный список(массив) всех блюд ресторана`,
        schema: {
            example: [
                {
                    id: 1,
                    name: 'Картофель фри',
                    description: 'Картофель фри с соусом',
                    price: 100.12,
                    createdAt: '2021-08-01T12:00:00.000Z',
                    updatedAt: '2021-08-01T12:00:00.000Z'
                },
                {
                    id: 2,
                    name: 'Гамбургер',
                    description: 'Гамбургер с сыром',
                    price: 200.12,
                    createdAt: '2021-08-01T12:00:00.000Z',
                    updatedAt: '2021-08-01T12:00:00.000Z'
                }
            ]
        }
    })
    @Get() // +
    @RestaurantOnly()
    @UseGuards(AuthGuard)
    async findAll(@RestaurantOrCourierId() restaurantId: number) {
        return this.catalogService.findAllRestaurantCatalogItems(restaurantId);
    }

    @ApiOperation({
        summary: 'Получение конкретного блюда ресторана по идентификтору(id)'
    })
    @ApiParam({ name: 'id', required: true, description: 'Идентификатор блюда в ресторане(id)' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: `Описание блюда`,
        schema: {
            example: {
                id: 1,
                name: 'Картофель фри',
                description: 'Картофель фри с соусом',
                price: 100.12,
                createdAt: '2021-08-01T12:00:00.000Z',
                updatedAt: '2021-08-01T12:00:00.000Z'
            }
        }
    })
    @Get(':id') // +
    @RestaurantOnly()
    @UseGuards(AuthGuard)
    async findOne(@RestaurantOrCourierId() restaurantId: number, @Param('id') id: string) {
        return this.catalogService.findOne(+id, restaurantId);
    }

    @ApiOperation({
        summary: 'Удаление конкретного блюда ресторана по идентификтору(id)'
    })
    @ApiParam({ name: 'id', required: true, description: 'Идентификатор блюда в ресторане(id)' })
    @ApiResponse({ status: HttpStatus.OK })
    @Delete(':id')
    @RestaurantOnly()
    @UseGuards(AuthGuard)
    async remove(@RestaurantOrCourierId() restaurantId: number, @Param('id') id: string) {
        return this.catalogService.remove(+id, restaurantId);
    }
}
