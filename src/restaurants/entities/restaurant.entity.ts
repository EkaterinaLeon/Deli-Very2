import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { BankCard } from '../../bank-cards/entities/bank-card.entity';
import { CatalogItem } from '../../catalog/entities/catalog-item.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity('restaurants')
export class Restaurant {
    @PrimaryGeneratedColumn({ type: 'integer' })
    public readonly id: number;

    @Column({ nullable: true, type: 'varchar' })
    name: string;

    @Column({ nullable: true, type: 'varchar' })
    address: string;

    @Column({ nullable: false, type: 'varchar' })
    phoneNumber: string;

    @Column({ nullable: false, type: 'varchar' })
    password: string;

    @Column({ nullable: true, type: 'varchar' })
    email: string;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @Column({ nullable: true, type: 'integer' })
    public readonly bankCardId: number;

    @OneToOne(() => BankCard, bankCard => bankCard.restaurant)
    @JoinColumn({ name: 'bankCardId' })
    bankCard: BankCard;

    @OneToMany(() => CatalogItem, catalogItem => catalogItem.restaurant)
    public readonly catalogItems: CatalogItem[];

    @OneToMany(() => Order, order => order.restaurant)
    public readonly orders: Order[];
}
