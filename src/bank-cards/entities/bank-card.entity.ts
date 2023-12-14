import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { Courier } from '../../courier/entities/courier.entity';

@Entity('bank_cards')
@Unique(['cardNumber'])
export class BankCard {
    @PrimaryGeneratedColumn({ type: 'integer' })
    public readonly id: number;

    @Column({ nullable: false, type: 'varchar' })
    public readonly cardNumber: string;

    @Column({ nullable: false, type: 'varchar' })
    expireAt: string;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @OneToOne(() => Restaurant, restaurant => restaurant.bankCard)
    restaurant: Restaurant;

    @OneToOne(() => Courier, courier => courier.bankCard)
    courier: Courier;
}
