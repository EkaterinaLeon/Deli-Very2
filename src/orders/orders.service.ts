import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { TStatues, UpdateOrderDto } from './dto/update-order.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';
import { Order } from './entities/order.entity';
import { TUserRoles, TWithRestaurantId } from '../types';
import { checkIfEntityBelongsToUser } from '../helpers';
import { OrderCatalogItem } from './entities/order-catalog-item.entity';
import { CatalogItem } from '../catalog/entities/catalog-item.entity';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';

@Injectable()
export class OrdersService {
    constructor(
        @InjectDataSource()
        public readonly connection: DataSource
    ) {}

    private getExistingOrderWithRelations(manager: EntityManager, orderId: number) {
        return manager.getRepository(Order).findOneOrFail({
            where: { id: orderId },
            relations: {
                orderCatalogItems: {
                    catalogItem: true
                },
                courier: true,
                restaurant: true
            }
        });
    }
    async create(createOrderDto: TWithRestaurantId<CreateOrderDto>) {
        return this.connection.manager.transaction('REPEATABLE READ', async manager => {
            const { restaurantId, orderCatalogItems, ...orderData } = createOrderDto;
            // созадаем заказ
            const createdOrderData = await manager.insert(Order, { ...orderData, restaurantId });
            const orderId = createdOrderData.identifiers[0].id;
            // добавляем в заказ блюда
            await Promise.all(
                orderCatalogItems.map(async ({ catalogItemId, quantity }) => {
                    await checkIfEntityBelongsToUser(CatalogItem, catalogItemId, { restaurantId }, manager);
                    await manager.insert(OrderCatalogItem, { orderId, catalogItemId, quantity });
                })
            );
            // вычисляем цену заказа
            const order = await this.getExistingOrderWithRelations(manager, orderId);
            const price = order.orderCatalogItems.reduce((acc, orderCatalogItem) => {
                return acc + orderCatalogItem.catalogItem.price * orderCatalogItem.quantity;
            }, 0);
            await manager.update(Order, { id: orderId }, { price, finalPrice: price });
            return this.getExistingOrderWithRelations(manager, orderId);
        });
    }

    async findAllUserOrders(userId: number, userRole: TUserRoles, statuses?: TStatues[]) {
        const orders = await this.connection.manager.getRepository(Order).find({
            where: {
                restaurantId: userRole === 'restaurant' ? userId : undefined,
                courierId: userRole === 'restaurant' ? undefined : userId,
                status: statuses ? In(statuses) : undefined
            },
            order: { status: 'ASC', deliveryAt: 'ASC', updatedAt: 'DESC' },
            relations: {
                orderCatalogItems: {
                    catalogItem: true
                },
                courier: true,
                restaurant: true
            }
        });
        return orders;
    }

    async findAvailableForCouriersOrders() {
        const orders = this.connection.manager.getRepository(Order).find({
            where: { status: 0 },
            order: { status: 'ASC', deliveryAt: 'ASC', updatedAt: 'DESC' },
            relations: {
                orderCatalogItems: {
                    catalogItem: true
                },
                courier: true,
                restaurant: true
            }
        });
        return orders;
    }

    async findOne(orderId: number, userId: number, userRole: TUserRoles) {
        return await this.connection.manager.transaction(async manager => {
            const isCourier = userRole === 'courier';
            const filter = isCourier ? { courierId: userId } : { restaurantId: userId };
            await checkIfEntityBelongsToUser(Order, orderId, filter, manager);
            const order = manager.getRepository(Order).findOne({
                where: { id: orderId, ...filter },
                relations: {
                    orderCatalogItems: {
                        catalogItem: true
                    },
                    courier: true,
                    restaurant: true
                }
            });
            if (!order) {
                throw new NotFoundException(`Order with id ${orderId} does not exist`);
            }
            return order;
        });
    }

    async update(orderId: number, updateOrderDto: UpdateOrderDto & { userId: number; userRole: TUserRoles }) {
        return await this.connection.manager.transaction('REPEATABLE READ', async manager => {
            const { userId, userRole, ...orderData } = updateOrderDto;
            const isCourier = userRole === 'courier';
            const filter = isCourier ? { courierId: userId } : { restaurantId: userId };
            if (isCourier) {
                if (updateOrderDto.status === undefined) {
                    throw new BadRequestException(`Status is required for courier`);
                }
                const order = await manager.getRepository(Order).findOneOrFail({ where: { id: orderId } });
                const orderPath = `${order.status} -> ${updateOrderDto.status}`;
                let newOrderStatus;
                // Курьер можем менять статус заказа только:
                switch (orderPath) {
                    // поиск -> принят
                    case '0 -> 1': {
                        newOrderStatus = 1;
                        break;
                    }
                    // прият -> доставлен
                    case '1 -> 2': {
                        await checkIfEntityBelongsToUser(Order, orderId, filter, manager);
                        newOrderStatus = 2;
                        break;
                    }
                    default: {
                        throw new BadRequestException(
                            `Order with id ${orderId} can not be updated from status ${orderPath}`
                        );
                    }
                }
                await manager.update(Order, { id: orderId }, { status: newOrderStatus, ...filter });
            } else {
                await checkIfEntityBelongsToUser(Order, orderId, filter, manager);
                await manager.update(Order, { id: orderId }, orderData);
            }
            return this.getExistingOrderWithRelations(manager, orderId);
        });
    }
}
