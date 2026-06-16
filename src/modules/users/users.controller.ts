import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { GetUser } from '../../core/decorators/get-user.decorator';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy thông tin cá nhân của người dùng đăng nhập' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin thành công.',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token xác thực không hợp lệ hoặc đã hết hạn.',
  })
  async getProfile(@GetUser('id') userId: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(userId);
    return UserResponseDto.fromEntity(user);
  }
}
