import { IsDefined, IsPhoneNumber, MinLength } from 'class-validator';

export class CreateRestaurantDto {
    @IsDefined()
    @IsPhoneNumber('RU')
    phoneNumber: string;

    @IsDefined()
    @MinLength(8)
    password: string;
}
