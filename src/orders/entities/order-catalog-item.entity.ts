import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { Order } from './order.entity';
import { CatalogItem } from '../../catalog/entities/catalog-item.entity';

@Entity('order_catalog_items')
export class OrderCatalogItem {
    @PrimaryGeneratedColumn({ type: 'integer' })
    public readonly id: number;

    @Column({ nullable: false, type: 'integer' })
    public readonly orderId: number;

    @ManyToOne(() => Order, order => order.orderCatalogItems)
    @JoinColumn({ name: 'orderId' })
    public readonly order: Order;

    @Column({ nullable: false, type: 'integer' })
    public readonly catalogItemId: number;

    @ManyToOne(() => CatalogItem, catalogItem => catalogItem.orderCatalogItems)
    @JoinColumn({ name: 'catalogItemId' })
    public readonly catalogItem: CatalogItem;

    @Column({ nullable: false, type: 'integer', default: 1 })
    public readonly quantity: number;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}
