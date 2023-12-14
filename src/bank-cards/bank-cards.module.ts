import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankCard } from './entities/bank-card.entity';

@Module({
    imports: [TypeOrmModule.forFeature([BankCard])]
})
export class BankCardsModule {}
