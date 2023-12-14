import { Controller, Post, Body, Put, UseGuards, HttpStatus } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { LoginDto } from './dto/login-dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { RestaurantOrCourierId } from '../auth/tokenExtractor';
import { AuthGuard, RestaurantOnly } from '../auth/auth.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Рестораны')
@Controller('restaurants')
export class RestaurantsController {
    constructor(private readonly restaurantsService: RestaurantsService) {}

    @ApiOperation({ summary: 'Логин для организации' })
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
        return this.restaurantsService.login(createRestaurantDto);
    }

    @ApiOperation({ summary: `Обновление данных организации(bankCard, email, address, name)` })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: `Данные организации обновлены`
    })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Неверно сформированы данные для запроса' })
    @Put()
    @RestaurantOnly()
    @UseGuards(AuthGuard)
    async update(@RestaurantOrCourierId() restaurantId: number, @Body() updateRestaurantDto: UpdateRestaurantDto) {
        return this.restaurantsService.update(restaurantId, updateRestaurantDto);
    }
}
