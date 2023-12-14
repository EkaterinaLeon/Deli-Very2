import { IsEmail, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateBankCardDto } from '../../bank-cards/dto/create-bank-card.dto';
import { ApiProperty, PartialType } from '@nestjs/swagger';

class UpdateCourierDtoBase {
    @ApiProperty({ description: 'Имя', type: String, example: 'Иван', nullable: true })
    @IsString()
    firstName: string;

    @ApiProperty({ description: 'Отчество', type: String, example: 'Иванович', nullable: true })
    @IsString()
    middleName: string;

    @ApiProperty({ description: 'Фамилия', type: String, example: 'Иванов', nullable: true })
    @IsString()
    lastName: string;

    @ApiProperty({ description: 'Email', type: String, example: 'a@a.com', nullable: true })
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'Данные банковоской карты', type: () => CreateBankCardDto })
    @ValidateNested()
    @Type(() => CreateBankCardDto)
    bankCard: CreateBankCardDto;
}
export class UpdateCourierDto extends PartialType(UpdateCourierDtoBase) {}
