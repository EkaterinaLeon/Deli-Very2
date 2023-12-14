import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

@Entity('auth_codes')
@Unique(['phoneNumber'])
export class AuthCode {
    @PrimaryGeneratedColumn({ type: 'integer' })
    public readonly id: number;

    @Column({ nullable: false, type: 'integer' })
    public readonly code: number;

    @Column({ nullable: false, type: 'varchar' })
    phoneNumber: string;

    @Column({ nullable: false, type: 'varchar' })
    secret: string;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}
