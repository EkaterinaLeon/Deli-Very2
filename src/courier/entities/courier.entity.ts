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
import { Order } from '../../orders/entities/order.entity';

@Entity('couriers')
export class Courier {
    @PrimaryGeneratedColumn({ type: 'integer' })
    public readonly id: number;

    @Column({ nullable: true, type: 'varchar' })
    firstName: string | null;

    @Column({ nullable: true, type: 'varchar' })
    middleName: string | null;

    @Column({ nullable: true, type: 'varchar' })
    lastName: string | null;

    @Column({ nullable: false, type: 'varchar' })
    phoneNumber: string;

    @Column({ nullable: false, type: 'varchar' })
    password: string;

    @Column({ nullable: true, type: 'varchar' })
    email: string | null;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @Column({ nullable: true, type: 'integer' })
    public readonly bankCardId: number;

    @OneToOne(() => BankCard, bankCard => bankCard.restaurant)
    @JoinColumn({ name: 'bankCardId' })
    bankCard: BankCard;

    @OneToMany(() => Order, order => order.courier)
    public readonly orders: Order[];
}
