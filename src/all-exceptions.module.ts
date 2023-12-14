import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Request, Response } from 'express';

export function getErrorStatus(err: Error) {
    return err instanceof HttpException ? err.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    async catch(exception: Error | HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = getErrorStatus(exception);
        this.logger.error({ exception, body: request?.body });
        return response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: exception.message
        });
    }
}

@Module({
    providers: [
        {
            provide: APP_FILTER,
            useClass: AllExceptionsFilter
        }
    ]
})
export class AllExceptionsModule {}
