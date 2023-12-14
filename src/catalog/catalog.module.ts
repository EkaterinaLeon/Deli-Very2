import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogItem } from './entities/catalog-item.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CatalogItem])],
    controllers: [CatalogController],
    providers: [CatalogService]
})
export class CatalogModule {}
