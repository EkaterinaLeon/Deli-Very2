import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { TStatues } from './update-order.dto';
import { ApiProperty } from '@nestjs/swagger';

export class FindOrdersDto {
    @ApiProperty({ description: 'Фильтр статусов', type: String, example: '0,2,3' })
    @IsOptional()
    @Transform(({ value }) => {
        return value.split(',').map(item => Number(item));
    })
    statuses?: TStatues[];
}
