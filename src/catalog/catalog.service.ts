import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCatalogItemDto } from './dto/create-catalog-item.dto';
import { UpdateCatalogItemDto } from './dto/update-catalog-item.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CatalogItem } from './entities/catalog-item.entity';
import { TWithRestaurantId } from '../types';
import { checkIfEntityBelongsToUser } from '../helpers';

@Injectable()
export class CatalogService {
    constructor(@InjectDataSource() public readonly connection: DataSource) {}
    async create(createCatalogItemDto: TWithRestaurantId<CreateCatalogItemDto>) {
        return this.connection.manager.transaction('REPEATABLE READ', async manager => {
            const { restaurantId, ...itemData } = createCatalogItemDto;
            const currentCatalogItem = await manager.findOne(CatalogItem, {
                where: { restaurantId, name: itemData.name }
            });
            if (currentCatalogItem) {
                await manager.update(CatalogItem, { id: currentCatalogItem.id }, itemData);
            } else {
                await manager.save(CatalogItem, { restaurantId, ...itemData });
            }
            return manager.findOneOrFail(CatalogItem, { where: { restaurantId, name: itemData.name } });
        });
    }

    async update(id: number, updateCatalogDto: TWithRestaurantId<UpdateCatalogItemDto>) {
        await checkIfEntityBelongsToUser(
            CatalogItem,
            id,
            { restaurantId: updateCatalogDto.restaurantId },
            this.connection.manager
        );
        await this.connection.manager.update(CatalogItem, { id }, updateCatalogDto);
    }
    findAllRestaurantCatalogItems(restaurantId: number) {
        return this.connection.manager.find(CatalogItem, { where: { restaurantId }, order: { id: 'ASC' } });
    }

    async findOne(id: number, restaurantId: number) {
        await checkIfEntityBelongsToUser(CatalogItem, id, { restaurantId }, this.connection.manager);
        const catalogItem = await this.connection.manager.findOne(CatalogItem, { where: { id } });
        if (!catalogItem) {
            throw new NotFoundException(`Catalog item with id ${id} does not exist`);
        }
        return catalogItem;
    }

    async remove(id: number, restaurantId: number) {
        await checkIfEntityBelongsToUser(CatalogItem, id, { restaurantId }, this.connection.manager);
        return this.connection.manager.delete(CatalogItem, { id });
    }
}
