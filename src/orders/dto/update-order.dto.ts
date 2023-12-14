import { IsEnum, IsISO8601, IsOptional, IsPhoneNumber, IsPositive, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// статус заказа. 0 - новый(поиск), 1 - в работе(принят), 2 - доставлен(выполнен), 3 - отменен(завершен)
export const statuses = [0, 1, 2, 3] as const;
export type TStatues = (typeof statuses)[number];
export class UpdateOrderDto {
    @ApiProperty({ description: 'Адрес доставки', type: String, example: 'ул. Пушкина', nullable: true })
    @IsOptional()
    @IsString()
    @MinLength(1)
    address?: string;

    @ApiProperty({
        description: 'Номер телефона клиента ресторана',
        type: String,
        example: '+79780000000',
        nullable: true
    })
    @IsOptional()
    @IsPhoneNumber('RU')
    phoneNumber?: string;

    @ApiProperty({
        description: 'Желаемое время доставки заказа клиенту',
        type: String,
        example: '2021-08-01T12:00:00.000Z',
        nullable: true
    })
    @IsOptional()
    @IsISO8601()
    deliveryAt?: string;

    @ApiProperty({
        description:
            'Статус заказа. 0 - новый(поиск), 1 - в работе(принят), 2 - доставлен(выполнен), 3 - отменен(завершен)',
        enum: statuses,
        example: 'restaurant',
        nullable: true
    })
    @IsOptional()
    @IsEnum(statuses)
    status?: TStatues;

    @ApiProperty({
        description: 'Окончательная цена c учетом скидок и доплат',
        type: Number,
        example: 123.55,
        nullable: true
    })
    @IsOptional()
    @IsPositive()
    finalPrice?: number;
}
