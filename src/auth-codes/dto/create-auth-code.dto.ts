import { IsDefined, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthCodeDto {
    @ApiProperty({ description: 'Номер телефона', type: String, example: '+79780001234' })
    @IsDefined()
    @IsPhoneNumber('RU')
    phoneNumber: string;
}
