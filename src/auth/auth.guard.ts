import * as jwt from 'jsonwebtoken';
import { Injectable, CanActivate, ExecutionContext, SetMetadata } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { isPASTokenDto, TokenDTO } from './token-data.dto';
import { TUserRoles } from '../types';

export const TOKEN_OWNER_TYPE = 'TOKEN_OWNER_TYPE';
export const RestaurantOnly = () => {
    return SetMetadata(TOKEN_OWNER_TYPE, 'restaurant');
};
export const CourierOnly = () => {
    return SetMetadata(TOKEN_OWNER_TYPE, 'courier');
};
@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private configService: ConfigService
    ) {}

    private async validateRequest(request: Request & { tokenData?: TokenDTO }, tokenOwnerType?: TUserRoles) {
        const authHeader = request.headers.authorization || '';
        const tokenRegexp = /^Bearer (\S+)$/i;
        const [, token] = authHeader.match(tokenRegexp) || ['', ''];
        if (token) {
            const decodedToken = jwt.decode(token, this.configService.getOrThrow('JWT_SECRET'));
            if (
                decodedToken &&
                isPASTokenDto(decodedToken) &&
                (tokenOwnerType ? decodedToken.role === tokenOwnerType : true)
            ) {
                request.tokenData = { ...decodedToken, id: +decodedToken.id } as TokenDTO;
                return true;
            }
        }
        return false;
    }

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest<Request>();
        const tokenOwnerType = this.reflector.get<TokenDTO['role'] | undefined>(TOKEN_OWNER_TYPE, context.getHandler());
        return this.validateRequest(request, tokenOwnerType);
    }
}
