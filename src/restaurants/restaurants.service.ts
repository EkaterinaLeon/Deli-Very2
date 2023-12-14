import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { LoginDto } from './dto/login-dto';
import { AuthCode } from '../auth-codes/entities/auth-code.entity';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { BankCard } from '../bank-cards/entities/bank-card.entity';
import { CryptoService } from '../crypto/crypto.service';
@Injectable()
export class RestaurantsService {
    constructor(
        @InjectDataSource()
        public readonly dataSource: DataSource,
        public readonly cryptoService: CryptoService
    ) {}

    async create(createRestaurantDto: CreateRestaurantDto) {
        return this.dataSource.manager.save(Restaurant, {
            phoneNumber: createRestaurantDto.phoneNumber,
            password: await this.cryptoService.getHash(createRestaurantDto.password)
        });
    }

    async findByPhoneNumber(phoneNumber: string) {
        return this.dataSource.manager.findOne(Restaurant, {
            where: {
                phoneNumber
            }
        });
    }

    async login(loginAuthCodeDto: LoginDto) {
        const tokenData = await this.findByPhoneNumberAndPassword(
            loginAuthCodeDto.phoneNumber,
            loginAuthCodeDto.password
        );
        await this.dataSource.manager.delete(AuthCode, { phoneNumber: loginAuthCodeDto.phoneNumber });
        return tokenData;
    }

    async findByPhoneNumberAndPassword(phoneNumber: string, password: string) {
        const restaurant = await this.dataSource.manager.findOne(Restaurant, {
            where: {
                phoneNumber
            }
        });
        if (!restaurant) {
            throw new UnauthorizedException('Wrong credentials');
        }
        await this.cryptoService.verifyPassword(password, restaurant.password);
        return this.cryptoService.createToken({ id: restaurant.id, role: 'restaurant', phoneNumber });
    }

    async update(id: number, updateRestaurantDto: UpdateRestaurantDto) {
        await this.dataSource.manager.transaction('REPEATABLE READ', async manager => {
            const { bankCard, ...restData } = updateRestaurantDto;
            if (Object.keys(restData).length) {
                await manager.update(Restaurant, id, restData);
            }
            if (bankCard) {
                const existingBankCard = await manager.findOne(BankCard, {
                    where: { cardNumber: bankCard.cardNumber },
                    relations: {
                        courier: true,
                        restaurant: true
                    }
                });
                let bankCardId: number;
                if (!existingBankCard) {
                    const { identifiers } = await manager.insert(BankCard, {
                        ...bankCard
                    });
                    bankCardId = identifiers[0].id;
                } else {
                    const bankCardCourierId = existingBankCard.courier?.id;
                    const bankCardRestaurantId = existingBankCard.restaurant?.id;
                    // если карта не привязана ни к кому
                    if (!bankCardCourierId && !bankCardRestaurantId) {
                        const { identifiers } = await manager.insert(BankCard, {
                            ...bankCard
                        });
                        bankCardId = identifiers[0].id;
                    } else if (bankCardRestaurantId && bankCardRestaurantId !== id) {
                        // если карта привязана к ресторану, но не текущему
                        throw new BadRequestException(
                            `Bank card with number ${bankCard.cardNumber} already exists for other restaurant`
                        );
                    } else {
                        // если карта привязана к текущему курьеру или ресторану
                        bankCardId = existingBankCard.id;
                    }
                }
                await manager.update(Restaurant, id, { bankCardId });
            }
        });
    }
}
