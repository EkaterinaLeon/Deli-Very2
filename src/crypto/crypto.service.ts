import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { TUserRoles } from '../types';

@Injectable()
export class CryptoService {
    constructor(public readonly configService: ConfigService) {}

    async getHash(password: string) {
        return bcrypt.hash(password, Number(this.configService.getOrThrow<number>('SALT_ROUNDS')));
    }

    async createToken(data: { id: number; role: TUserRoles; phoneNumber: string }) {
        return { token: jwt.sign(data, this.configService.getOrThrow<string>('JWT_SECRET')) };
    }

    async verifyPassword(password: string, hashedPassword: string) {
        const isValidPassword = await bcrypt.compare(password, hashedPassword);
        if (!isValidPassword) {
            throw new UnauthorizedException('Wrong credentials');
        }
    }
}
