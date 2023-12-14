import { IsDefined, IsEnum, IsPhoneNumber, IsPositive, Max, Min } from 'class-validator';
import { TUserRoles } from '../../types';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmAuthCodeDto {
    @ApiProperty({ description: 'Номер телефона', type: String, example: '+79780001234' })
    @IsDefined()
    @IsPhoneNumber('RU')
    phoneNumber: string;

    @ApiProperty({ description: 'Код подтверждения', type: Number, example: 1234 })
    @IsDefined()
    @IsPositive()
    @Min(1_000)
    @Max(9_999)
    code: number;

    @ApiProperty({
        description: 'Тип пользователя(ресторан или курьер)',
        enum: ['restaurant', 'courier'],
        example: 'restaurant'
    })
    @IsDefined()
    @IsEnum(['restaurant', 'courier'])
    userRole: TUserRoles;
}
