import { TokenDTO } from './token-data.dto';
import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

export function getDataFromTokenFactory<K extends keyof TokenDTO>(ctx: ExecutionContext, tokenKey: K) {
    const request = ctx.switchToHttp().getRequest() as Parameters<AuthGuard['validateRequest']>[0];
    const tokenData = request.tokenData;
    if (!tokenData) {
        throw new InternalServerErrorException('Token does not exist in request');
    }

    const valueFromToken = tokenData[tokenKey];
    if (!valueFromToken) {
        throw new InternalServerErrorException(`Token value does not exist`);
    }

    return valueFromToken;
}

export const RestaurantOrCourierId = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    return getDataFromTokenFactory(ctx, 'id');
});

export const UserRole = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    return getDataFromTokenFactory(ctx, 'role');
});
