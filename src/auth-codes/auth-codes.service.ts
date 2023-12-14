import * as crypto from 'crypto';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateAuthCodeDto } from './dto/create-auth-code.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuthCode } from './entities/auth-code.entity';
import { ConfirmAuthCodeDto } from './dto/confirm-auth-code.dto';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { RegisterAuthCodeDto } from './dto/register-auth-codes-dto';
import { CourierService } from '../courier/courier.service';
import { TUserRoles, TWithUserRole } from '../types';
import { CryptoService } from '../crypto/crypto.service';

@Injectable()
export class AuthCodesService {
    private readonly logger = new Logger(AuthCodesService.name);
    constructor(
        @InjectDataSource()
        public readonly dataSource: DataSource,

        public readonly restaurantsService: RestaurantsService,
        public readonly courierService: CourierService,
        public readonly cryptoService: CryptoService
    ) {}
    async create(createAuthCodeDto: CreateAuthCodeDto) {
        const { phoneNumber } = createAuthCodeDto;
        await this.dataSource.manager.delete(AuthCode, { phoneNumber });
        const randomNum = Math.random() * 9000;
        const code = Math.floor(1000 + randomNum);
        const authCode = await this.dataSource.manager.save(AuthCode, {
            code,
            phoneNumber,
            secret: crypto.randomUUID()
        });
        this.logger.warn({ msg: 'created auth code', phoneNumber: authCode.phoneNumber, code: authCode.code });
        // TODO: remove this line after actual sms sending
        return { code };
    }

    private getUserServiceByUserRole(userRole: TUserRoles) {
        return userRole === 'restaurant' ? this.restaurantsService : this.courierService;
    }
    async confirm(confirmAuthCodeDto: ConfirmAuthCodeDto) {
        const { phoneNumber, code, userRole } = confirmAuthCodeDto;
        const authCode = await this.dataSource.manager.findOne(AuthCode, {
            where: {
                phoneNumber,
                code
            }
        });
        if (!authCode) {
            throw new NotFoundException(`Auth code for phone: ${phoneNumber} not found`);
        }
        /**
         * Если получает секрет - то надо отобразить старницу ввода пароля
         * Если получает моедль ресторана - то надо отобразить страницу логина(в модели уже будет телефон)
         */
        const userService = this.getUserServiceByUserRole(userRole);
        const user = await userService.findByPhoneNumber(phoneNumber);
        if (user) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...userData } = user;
            return { user: userData, userRole };
        }
        return { secret: authCode.secret, userRole };
    }

    async register(registerAuthCodeDto: TWithUserRole<RegisterAuthCodeDto>) {
        const { phoneNumber, password, secret, userRole } = registerAuthCodeDto;
        const authCode = await this.dataSource.manager.findOne(AuthCode, {
            where: {
                phoneNumber,
                secret
            }
        });
        if (!authCode) {
            throw new NotFoundException(`Auth code for phone: ${phoneNumber} with specified secret not found`);
        }
        const userService = this.getUserServiceByUserRole(userRole);
        const newUser = await userService.create({
            phoneNumber,
            password
        });
        await this.dataSource.manager.delete(AuthCode, { id: authCode.id });
        return this.cryptoService.createToken({
            id: newUser.id,
            role: userRole,
            phoneNumber
        });
    }
}
