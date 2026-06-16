import { Controller, Get, UseGuards, Body, Patch, Post } from '@nestjs/common';
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
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

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

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công.',
    type: UserResponseDto,
  })
  async updateProfile(
    @GetUser('id') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    const updatedUser = await this.usersService.updateProfile(
      userId,
      updateProfileDto,
    );
    return UserResponseDto.fromEntity(updatedUser);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Đổi mật khẩu' })
  @ApiResponse({
    status: 200,
    description: 'Đổi mật khẩu thành công.',
  })
  async changePassword(
    @GetUser('id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.usersService.changePassword(userId, changePasswordDto);
    return { message: 'Đổi mật khẩu thành công' };
  }
}
