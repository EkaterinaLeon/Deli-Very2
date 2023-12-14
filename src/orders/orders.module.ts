import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderCatalogItem } from './entities/order-catalog-item.entity';
import { Courier } from '../courier/entities/courier.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Order, OrderCatalogItem, Courier])],
    controllers: [OrdersController],
    providers: [OrdersService]
})
export class OrdersModule {}
