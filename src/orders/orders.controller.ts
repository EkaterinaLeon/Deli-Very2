import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query, HttpStatus } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthGuard, CourierOnly, RestaurantOnly } from '../auth/auth.guard';
import { RestaurantOrCourierId, UserRole } from '../auth/tokenExtractor';
import { FindOrdersDto } from './dto/find-orders.dto';
import { TUserRoles } from '../types';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Заказы')
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @ApiOperation({
        summary: 'Создание заказа рестораном'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: `Созданный заказ, включая список блюд в указанном заказе`,
        schema: {
            example: {
                id: 1,
                restaurantId: 1,
                address: 'ул. Пушкина, дом Колотушкина',
                phoneNumber: '+79780000004',
                deliveryAt: null,
                status: 0, // статус заказа. 0 - новый(поиск), 1 - в работе(принят), 2 - доставлен(выполнен), 3 - отменен(завершен)
                price: 1300,
                finalPrice: 1300,
                orderCatalogItems: [
                    {
                        catalogItem: {
                            id: 1,
                            name: 'Картофель фри',
                            description: 'Картофель фри с соусом',
                            price: 300
                        },
                        quantity: 1
                    },
                    {
                        catalogItem: {
                            id: 2,
                            name: 'Гамбургер',
                            description: 'Гамбургер с сыром',
                            price: 500
                        },
                        quantity: 2
                    }
                ]
            }
        }
    })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Неверно сформированы данные для запроса' })
    @Post()
    @RestaurantOnly()
    @UseGuards(AuthGuard)
    async create(@RestaurantOrCourierId() restaurantId: number, @Body() createOrderDto: CreateOrderDto) {
        const order = await this.ordersService.create({ ...createOrderDto, restaurantId });
        return order;
    }

    @ApiOperation({
        summary: `Обновление заказа. Доступно как для ресторанов так и для курьеров. Курьеры могут обновлять только статус.
        Курьеру досупно обовление статуса только на (поиск(0) -> принят(1)) или (прият(1) -> доставлен(2)).
        Ресторан может обновлять все поля заказа, включая статус`
    })
    @ApiParam({ name: 'id', required: true, description: 'Идентификатор заказа' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: `Обновленный заказ, включая список блюд в указанном заказе`,
        schema: {
            example: {
                id: 1,
                restaurantId: 1,
                address: 'ул. Пушкина, дом Колотушкина',
                phoneNumber: '+79780000004',
                deliveryAt: null,
                status: 0, // статус заказа. 0 - новый(поиск), 1 - в работе(принят), 2 - доставлен(выполнен), 3 - отменен(завершен)
                price: 1300,
                finalPrice: 1300,
                orderCatalogItems: [
                    {
                        catalogItem: {
                            id: 1,
                            name: 'Картофель фри',
                            description: 'Картофель фри с соусом',
                            price: 300
                        },
                        quantity: 1
                    },
                    {
                        catalogItem: {
                            id: 2,
                            name: 'Гамбургер',
                            description: 'Гамбургер с сыром',
                            price: 500
                        },
                        quantity: 2
                    }
                ]
            }
        }
    })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Неверно сформированы данные для запроса' })
    @Patch(':id')
    @UseGuards(AuthGuard)
    async update(
        @RestaurantOrCourierId() userId: number,
        @UserRole() userRole: TUserRoles,
        @Param('id') id: string,
        @Body() updateOrderDto: UpdateOrderDto
    ) {
        return this.ordersService.update(+id, { ...updateOrderDto, userId, userRole });
    }

    @ApiOperation({
        summary: `Получение списка всех заказов ресторана или курьера.
            Курьер не может получить заказ которые не взяты им в работу.
            Заказы можно фильтровать по нескольким статусам.
            localhost:3000/orders?statuses=0,1,2,3 - получить все заказы со всеми статусами для ресторана или курьера.`
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: `Полный список(массив) всех заказов`,
        schema: {
            example: [
                {
                    id: 1,
                    restaurantId: 1,
                    address: 'ул. Пушкина, дом Колотушкина',
                    phoneNumber: '+79780000004',
                    deliveryAt: null,
                    status: 1,
                    price: 1300,
                    finalPrice: 1300,
                    orderCatalogItems: [
                        {
                            catalogItem: {
                                id: 1,
                                name: 'Картофель фри',
                                description: 'Картофель фри с соусом',
                                price: 300
                            },
                            quantity: 1
                        },
                        {
                            catalogItem: {
                                id: 2,
                                name: 'Гамбургер',
                                description: 'Гамбургер с сыром',
                                price: 500
                            },
                            quantity: 2
                        }
                    ]
                },
                {
                    id: 2,
                    restaurantId: 2,
                    address: 'ул. Дружбы, дом 4',
                    phoneNumber: '+79780000005',
                    deliveryAt: null,
                    status: 1,
                    price: 2100,
                    finalPrice: 2100,
                    orderCatalogItems: [
                        {
                            catalogItem: {
                                id: 3,
                                name: 'Торт',
                                description: 'Торт вишня',
                                price: 700
                            },
                            quantity: 3
                        }
                    ]
                }
            ]
        }
    })
    @ApiParam({ name: 'statuses', required: false, description: 'Фильтр по статусам заказовю Например statuses=0,1,2' })
    @Get()
    @UseGuards(AuthGuard)
    async findAllForUser(
        @RestaurantOrCourierId() userId: number,
        @UserRole() userRole: TUserRoles,
        @Query() findOrdersDto: FindOrdersDto
    ) {
        return this.ordersService.findAllUserOrders(userId, userRole, findOrdersDto.statuses);
    }

    @ApiOperation({
        summary: `Получение списка всех заказов всех ресторанов, которые могут взять в работу курьер.`
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: `Полный список(массив) всех заказов со статусом новый, их можно взять в работу`,
        schema: {
            example: [
                {
                    id: 1,
                    restaurantId: 1,
                    address: 'ул. Пушкина, дом Колотушкина',
                    phoneNumber: '+79780000004',
                    deliveryAt: null,
                    status: 0,
                    price: 1300,
                    finalPrice: 1300,
                    orderCatalogItems: [
                        {
                            catalogItem: {
                                id: 1,
                                name: 'Картофель фри',
                                description: 'Картофель фри с соусом',
                                price: 300
                            },
                            quantity: 1
                        },
                        {
                            catalogItem: {
                                id: 2,
                                name: 'Гамбургер',
                                description: 'Гамбургер с сыром',
                                price: 500
                            },
                            quantity: 2
                        }
                    ]
                },
                {
                    id: 2,
                    restaurantId: 2,
                    address: 'ул. Дружбы, дом 4',
                    phoneNumber: '+79780000005',
                    deliveryAt: null,
                    status: 0,
                    price: 2100,
                    finalPrice: 2100,
                    orderCatalogItems: [
                        {
                            catalogItem: {
                                id: 3,
                                name: 'Торт',
                                description: 'Торт вишня',
                                price: 700
                            },
                            quantity: 3
                        }
                    ]
                }
            ]
        }
    })
    // доступные для курьеров (со стаусом новые) во всех ресторанах
    @Get('available')
    @CourierOnly()
    @UseGuards(AuthGuard)
    async findAvailableForCouriers() {
        return this.ordersService.findAvailableForCouriersOrders();
    }

    @ApiOperation({
        summary: `Получение заказа по идентификатору(id)`
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: `Заказ включая дополнительнкю информацию`,
        schema: {
            example: {
                id: 1,
                restaurantId: 1,
                address: 'ул. Пушкина, дом Колотушкина',
                phoneNumber: '+79780000004',
                deliveryAt: null,
                status: 0,
                price: 1300,
                finalPrice: 1300,
                orderCatalogItems: [
                    {
                        catalogItem: {
                            id: 1,
                            name: 'Картофель фри',
                            description: 'Картофель фри с соусом',
                            price: 300
                        },
                        quantity: 1
                    },
                    {
                        catalogItem: {
                            id: 2,
                            name: 'Гамбургер',
                            description: 'Гамбургер с сыром',
                            price: 500
                        },
                        quantity: 2
                    }
                ]
            }
        }
    })
    @Get(':id')
    @UseGuards(AuthGuard)
    async findOne(@RestaurantOrCourierId() userId: number, @UserRole() userRole: TUserRoles, @Param('id') id: string) {
        return this.ordersService.findOne(+id, userId, userRole);
    }
}
