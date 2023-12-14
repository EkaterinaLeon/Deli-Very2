import { Module } from '@nestjs/common';
import { CourierService } from './courier.service';
import { CourierController } from './courier.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Courier } from './entities/courier.entity';
import { ConfigModule } from '@nestjs/config';
import { BankCardsModule } from '../bank-cards/bank-cards.module';
import { CryptoModule } from '../crypto/crypto.module';

@Module({
    imports: [TypeOrmModule.forFeature([Courier]), ConfigModule, BankCardsModule, CryptoModule],
    controllers: [CourierController],
    providers: [CourierService],
    exports: [CourierService]
})
export class CourierModule {}
