import { Controller, Post, Body, Put, HttpStatus } from '@nestjs/common';
import { AuthCodesService } from './auth-codes.service';
import { CreateAuthCodeDto } from './dto/create-auth-code.dto';
import { ConfirmAuthCodeDto } from './dto/confirm-auth-code.dto';
import { RegisterAuthCodeDto } from './dto/register-auth-codes-dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Регистрация')
@Controller('auth-codes')
export class AuthCodesController {
    constructor(private readonly authCodesService: AuthCodesService) {}

    @ApiOperation({ summary: 'Создание и отправка кода подтверждения по номеру телефона' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Код создан и отправлен(вывод в консоль)' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Неверно сформированы данные для запроса' })
    @Post()
    async create(@Body() createAuthCodeDto: CreateAuthCodeDto) {
        return this.authCodesService.create(createAuthCodeDto);
    }

    @ApiOperation({ summary: 'Подтверждение номера телефона' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: `Телефонный номер подтвержден.
            Если телефон еще не был зарегистрирован возвращаем модель содеражащую секрет необходимый для прохождения регистрации.
            Модель ресторана или курьера в случае`,
        schema: {
            example: [
                {
                    secret: 'abc...',
                    userRole: 'restaurant'
                },
                {
                    secret: 'abc...',
                    userRole: 'courier'
                },
                {
                    user: { id: 1 },
                    userRole: 'restaurant'
                },
                {
                    user: { id: 1 },
                    userRole: 'courier'
                }
            ]
        }
    })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Неверно сформированы данные для запроса' })
    @Put('confirm')
    async confirm(@Body() createAuthCodeDto: ConfirmAuthCodeDto) {
        return this.authCodesService.confirm(createAuthCodeDto);
    }

    @ApiOperation({ summary: 'Прохождение регистрации после подтверждения номера' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: `Токен(<token>) необходимый для авторизации. Устанавливается в заголовок Authorization. Authorization: Bearer <token>`,
        schema: {
            example: 'abc...'
        }
    })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Неверно сформированы данные для запроса' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Код для указанного телефона не найден' })
    @Put('register')
    async registerRestaurant(@Body() createAuthCodeDto: RegisterAuthCodeDto) {
        return this.authCodesService.register(createAuthCodeDto);
    }
}
