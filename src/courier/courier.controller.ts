import { Controller, Post, Body, Put, UseGuards, HttpStatus } from '@nestjs/common';
import { CourierService } from './courier.service';
import { LoginDto } from '../restaurants/dto/login-dto';
import { AuthGuard, CourierOnly } from '../auth/auth.guard';
import { RestaurantOrCourierId } from '../auth/tokenExtractor';
import { UpdateCourierDto } from './dto/update-courier.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Курьеры')
@Controller('couriers')
export class CourierController {
    constructor(private readonly courierService: CourierService) {}

    @ApiOperation({ summary: 'Логин для курьера' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: `Токен(<token>) необходимый для авторизации. Устанавливается в заголовок Authorization. Authorization: Bearer <token>`,
        schema: {
            example: 'abc...'
        }
    })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Неверно сформированы данные для запроса' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Неверная пара логин пароль' })
    @Post('login')
    async login(@Body() createRestaurantDto: LoginDto) {
        return this.courierService.login(createRestaurantDto);
    }

    @ApiOperation({ summary: `Обновление данных курьера` })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: `Данные курьера обновлены`
    })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Неверно сформированы данные для запроса' })
    @Put()
    @CourierOnly()
    @UseGuards(AuthGuard)
    async update(@RestaurantOrCourierId() restaurantId: number, @Body() updateRestaurantDto: UpdateCourierDto) {
        return this.courierService.update(restaurantId, updateRestaurantDto);
    }
}
