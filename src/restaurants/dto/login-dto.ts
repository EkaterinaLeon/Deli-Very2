import { IsDefined, IsPhoneNumber, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
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
}
