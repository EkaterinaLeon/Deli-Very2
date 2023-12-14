import { IsDefined, IsEnum, IsPhoneNumber, IsString, MinLength } from 'class-validator';
import { TUserRoles } from '../../types';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterAuthCodeDto {
    @ApiProperty({ description: 'Номер телефона', type: String, example: '+79780001234' })
    @IsDefined()
    @IsPhoneNumber('RU')
    phoneNumber: string;
    @ApiProperty({ description: 'Пароль', type: String, example: '$ecretPa$$w0rd' })
    @IsDefined()
    // @IsStrongPassword()
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ description: 'Полученный при подтверждении номера секрет', type: String, example: 'abc...' })
    @IsDefined()
    @IsString()
    secret: string;

    @ApiProperty({
        description: 'Тип пользователя(ресторан или курьер) для которго осущетсвляется регистрация',
        enum: ['restaurant', 'courier'],
        example: 'restaurant'
    })
    @IsDefined()
    @IsEnum(['restaurant', 'courier'])
    userRole: TUserRoles;
}
