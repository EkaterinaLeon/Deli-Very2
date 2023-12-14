import { IsEmail, IsString, MinLength, ValidateNested } from 'class-validator';
import { CreateBankCardDto } from '../../bank-cards/dto/create-bank-card.dto';
import { Type } from 'class-transformer';
import { ApiProperty, PartialType } from '@nestjs/swagger';

class UpdateRestaurantDtoBase {
    @ApiProperty({ description: 'Наименование', type: String, example: 'ЭльПастор' })
    @IsString()
    @MinLength(1)
    name: string;
    @ApiProperty({ description: 'Адресс', type: String, example: 'ул. Пушкина, д.2' })
    @IsString()
    @MinLength(1)
    address: string;

    @ApiProperty({ description: 'Email', type: String, example: 'a@a.com' })
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'Данные банковоской карты', type: () => CreateBankCardDto })
    @ValidateNested()
    @Type(() => CreateBankCardDto)
    bankCard: CreateBankCardDto;
}
export class UpdateRestaurantDto extends PartialType(UpdateRestaurantDtoBase) {}
