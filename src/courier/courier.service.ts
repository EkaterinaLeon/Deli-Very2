import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateCourierDto } from './dto/create-courier.dto';
import { UpdateCourierDto } from './dto/update-courier.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CryptoService } from '../crypto/crypto.service';
import { Courier } from './entities/courier.entity';
import { LoginDto } from '../restaurants/dto/login-dto';
import { AuthCode } from '../auth-codes/entities/auth-code.entity';
import { BankCard } from '../bank-cards/entities/bank-card.entity';

@Injectable()
export class CourierService {
    constructor(
        @InjectDataSource()
        public readonly dataSource: DataSource,
        public readonly cryptoService: CryptoService
    ) {}
    async create(createCourierDto: CreateCourierDto) {
        return this.dataSource.manager.save(Courier, {
            phoneNumber: createCourierDto.phoneNumber,
            password: await this.cryptoService.getHash(createCourierDto.password)
        });
    }

    async findByPhoneNumber(phoneNumber: string) {
        return this.dataSource.manager.findOne(Courier, {
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
        const courier = await this.findByPhoneNumber(phoneNumber);
        if (!courier) {
            throw new UnauthorizedException('Wrong credentials');
        }
        await this.cryptoService.verifyPassword(password, courier.password);
        return this.cryptoService.createToken({ id: courier.id, role: 'courier', phoneNumber });
    }
    async update(id: number, updateCourierDto: UpdateCourierDto) {
        await this.dataSource.manager.transaction('REPEATABLE READ', async manager => {
            const { bankCard, ...restData } = updateCourierDto;
            if (Object.keys(restData).length) {
                await manager.update(Courier, id, restData);
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
                    } else if (bankCardCourierId && bankCardCourierId !== id) {
                        // если карта привязана к курьеру, но не текущему
                        throw new BadRequestException(
                            `Bank card with number ${bankCard.cardNumber} already exists for other courier`
                        );
                    } else {
                        // если карта привязана к текущему курьеру или ресторану
                        bankCardId = existingBankCard.id;
                    }
                }
                await manager.update(Courier, id, { bankCardId });
            }
        });
    }
}
