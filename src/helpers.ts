import { CatalogItem } from './catalog/entities/catalog-item.entity';
import { ForbiddenException } from '@nestjs/common';
import { EntityTarget } from 'typeorm/common/EntityTarget';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';

export async function checkIfEntityBelongsToUser(
    entityTarget: EntityTarget<any>,
    entityId: CatalogItem['id'],
    filter: { restaurantId: number } | { courierId: number },
    manager: EntityManager
) {
    const catalogItem = await manager.findOne(entityTarget, {
        where: { id: entityId, ...filter }
    });
    if (!catalogItem) {
        throw new ForbiddenException(`Entity with id ${entityId} does not belong to user by filter ${filter}`);
    }
}
