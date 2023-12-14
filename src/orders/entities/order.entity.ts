import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { OrderCatalogItem } from './order-catalog-item.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { Courier } from '../../courier/entities/courier.entity';

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn({ type: 'integer' })
    public readonly id: number;

    @Column({ nullable: false, type: 'integer' })
    public readonly restaurantId: number;

    @ManyToOne(() => Restaurant, restaurant => restaurant.orders)
    @JoinColumn({ name: 'restaurantId' })
    public readonly restaurant: Restaurant;

    // id пользователя
    @Column({ nullable: false, type: 'varchar' })
    address: string;

    @Column({ nullable: false, type: 'varchar' })
    phoneNumber: string;

    // жеалемое время доставки
    @Column({ nullable: true, type: 'timestamp' })
    deliveryAt: Date;

    // статус заказа. 0 - новый(поиск), 1 - в работе(принят), 2 - доставлен(выполнен), 3 - отменен(завершен)
    @Column({ nullable: false, type: 'integer', default: 0 })
    status: 0 | 1 | 2 | 3;

    // сумма без скидки
    @Column({ nullable: false, type: 'float', default: 0 })
    price: number;

    // сумма к оплате
    @Column({ nullable: false, type: 'float', default: 0 })
    finalPrice: number;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @OneToMany(() => OrderCatalogItem, orderCatalogItem => orderCatalogItem.order)
    public readonly orderCatalogItems: OrderCatalogItem[];

    @Column({ nullable: true, type: 'integer' })
    public readonly courierId: number;

    @JoinColumn({ name: 'courierId' })
    @ManyToOne(() => Courier, courier => courier.orders)
    public readonly courier: Courier;
}
