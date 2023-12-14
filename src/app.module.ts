import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AuthCodesModule } from './auth-codes/auth-codes.module';
import { TypeOrmConfigService } from './configs/type-orm-config/type-orm-config.service';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { BankCardsModule } from './bank-cards/bank-cards.module';
import { CatalogModule } from './catalog/catalog.module';
import { OrdersModule } from './orders/orders.module';
import { CourierModule } from './courier/courier.module';
import { CryptoModule } from './crypto/crypto.module';
import { AllExceptionsModule } from './all-exceptions.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: `${process.env.NODE_ENV || 'test'}.env`,
            isGlobal: true
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useClass: TypeOrmConfigService,
            inject: [ConfigService]
        }),
        LoggerModule.forRoot({
            pinoHttp: {
                base: null,
                autoLogging: false,
                redact: {
                    paths: ['req.headers'],
                    remove: true
                },
                enabled: true
            }
        }),
        AuthCodesModule,
        RestaurantsModule,
        BankCardsModule,
        CatalogModule,
        OrdersModule,
        CourierModule,
        CryptoModule,
        AllExceptionsModule
    ]
})
export class AppModule {}
