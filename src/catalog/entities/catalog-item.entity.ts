import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn
} from 'typeorm';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { OrderCatalogItem } from '../../orders/entities/order-catalog-item.entity';

@Entity('catalog_items')
@Unique(['restaurantId', 'name'])
export class CatalogItem {
    @PrimaryGeneratedColumn({ type: 'integer' })
    public readonly id: number;

    @Column({ nullable: false, type: 'varchar', length: 255 })
    name: string;

    @Column({ nullable: false, type: 'float' })
    price: number;

    @Column({ nullable: true, type: 'text' })
    description: string;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @Column({ nullable: false, type: 'integer' })
    public readonly restaurantId: number;

    @ManyToOne(() => Restaurant, restaurant => restaurant.catalogItems)
    @JoinColumn({ name: 'restaurantId' })
    public readonly restaurant: Restaurant;

    @OneToMany(() => OrderCatalogItem, orderCatalogItem => orderCatalogItem.order)
    public readonly orderCatalogItems: OrderCatalogItem[];
}
