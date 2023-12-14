import {
    ArrayNotEmpty,
    IsDefined,
    IsISO8601,
    IsOptional,
    IsPhoneNumber,
    IsString,
    MinLength,
    ValidateNested
} from 'class-validator';
import { CreateOrderCatalogItemDto } from './create-order-catalog-item.dto';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
    @ApiProperty({ description: 'Адрес доставки', type: String, example: 'ул. Пушкина' })
    @IsDefined()
    @IsString()
    @MinLength(1)
    address: string;

    @ApiProperty({ description: 'Номер телефона клиента ресторана', type: String, example: '+79780000000' })
    @IsDefined()
    @IsPhoneNumber('RU')
    phoneNumber: string;

    @ApiProperty({
        description: 'Желаемое время доставки заказа клиенту',
        type: String,
        example: '2021-08-01T12:00:00.000Z'
    })
    @IsOptional()
    @IsISO8601()
    deliveryAt?: string;

    @ApiProperty({ description: 'Список блюд', type: () => CreateOrderCatalogItemDto, isArray: true })
    @IsDefined()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => CreateOrderCatalogItemDto)
    orderCatalogItems: CreateOrderCatalogItemDto[];
}
