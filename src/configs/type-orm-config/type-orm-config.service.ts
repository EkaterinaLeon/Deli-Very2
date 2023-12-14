import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
    constructor(private configService: ConfigService) {}

    createTypeOrmOptions(): TypeOrmModuleOptions & MysqlConnectionOptions {
        return {
            type: 'mysql',

            host: this.configService.getOrThrow<string>('DB_HOST'),
            port: this.configService.get<number>('DB_PORT'),
            username: this.configService.getOrThrow<string>('DB_USER'),
            password: this.configService.getOrThrow<string>('DB_PASS'),
            database: this.configService.getOrThrow<string>('DB_NAME'),
            synchronize: true,
            autoLoadEntities: true,

            migrationsRun: false,
            migrationsTableName: 'typeorm_migration_table',
            migrations: [__dirname + '/../../migration/*{.ts,.js}'],

            dropSchema: this.configService.get<number>('DB_DROP_SCHEMA') > 0,
            logging: this.configService.get<number>('DB_QUERY_LOGGING') > 0
        };
    }
}
