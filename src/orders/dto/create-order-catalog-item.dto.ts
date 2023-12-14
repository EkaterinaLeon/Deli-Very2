import { IsDefined, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderCatalogItemDto {
    @ApiProperty({ description: 'Идентифкиатор блюда в каталоге ретсорана', type: Number, example: 1 })
    @IsDefined()
    @IsNumber()
    catalogItemId: number;

    @ApiProperty({ description: 'Кол-во', type: Number, example: 2 })
    @IsDefined()
    @IsNumber()
    @Min(1)
    quantity: number;
}
