import { IsDefined, IsNumberString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBankCardDto {
    @ApiProperty({ description: 'Номер кредитной карты', type: String, example: '1234567890123457' })
    @IsDefined()
    @IsNumberString()
    @Length(16, 16)
    cardNumber: string;

    @ApiProperty({ description: 'Дата до которой карта валидна', type: String, example: '12/24' })
    @IsDefined()
    @Matches(/^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/)
    expireAt: string;
}
