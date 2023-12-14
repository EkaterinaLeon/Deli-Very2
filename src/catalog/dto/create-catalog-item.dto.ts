import { IsDefined, IsNumber, IsOptional, IsPositive, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatalogItemDto {
    @ApiProperty({ description: 'Наименование', type: String, example: 'Борщ' })
    @IsDefined()
    @IsString()
    @Length(1, 250)
    name: string;

    @ApiProperty({ description: 'Цена(за 1 единицу)', type: Number, example: 123.55 })
    @IsDefined()
    @IsNumber()
    @IsPositive()
    price: number;

    @ApiProperty({ description: 'Описание блюда', type: String, example: 'Борщ красный' })
    @IsOptional()
    @Length(1, 2_000)
    description: string;
}
