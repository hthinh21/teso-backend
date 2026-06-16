import { Controller, Post, Body, UseGuards, Ip } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LoginRateLimitGuard } from './guards/login-rate-limit.guard';
import { User } from '../users/entities/user.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản người dùng (User)' })
  @ApiResponse({
    status: 201,
    description: 'Đăng ký tài khoản thành công.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu đầu vào không hợp lệ hoặc thiếu.',
  })
  @ApiResponse({
    status: 409,
    description: 'Địa chỉ email đã tồn tại trên hệ thống.',
  })
  async register(@Body() registerDto: RegisterDto): Promise<User> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @UseGuards(LoginRateLimitGuard)
  @ApiOperation({
    summary: 'Đăng nhập tài khoản User',
    description:
      'Chặn bruteforce: Tối đa 5 lần thử login sai liên tiếp trên cùng IP+Email. Nếu vượt quá sẽ bị lock 15 phút.',
  })
  @ApiResponse({
    status: 200,
    description: 'Đăng nhập thành công, trả về Access Token.',
  })
  @ApiResponse({
    status: 401,
    description: 'Email hoặc mật khẩu không chính xác.',
  })
  @ApiTooManyRequestsResponse({
    description: 'Tài khoản bị khóa tạm thời 15 phút do nhập sai nhiều lần.',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
  ): Promise<{ accessToken: string; user: Omit<User, 'password'> }> {
    return this.authService.loginUser(loginDto, ip);
  }

  @Post('admin/login')
  @UseGuards(LoginRateLimitGuard)
  @ApiOperation({
    summary: 'Đăng nhập tài khoản Admin',
    description:
      'Chỉ chấp nhận tài khoản có role là admin. Có cơ chế chặn bruteforce tương tự như đăng nhập user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Đăng nhập thành công, trả về Access Token.',
  })
  @ApiResponse({
    status: 401,
    description: 'Email hoặc mật khẩu không chính xác.',
  })
  @ApiResponse({
    status: 403,
    description: 'Tài khoản không có quyền Admin.',
  })
  @ApiTooManyRequestsResponse({
    description: 'Tài khoản bị khóa tạm thời 15 phút do nhập sai nhiều lần.',
  })
  async loginAdmin(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
  ): Promise<{ accessToken: string; user: Omit<User, 'password'> }> {
    return this.authService.loginAdmin(loginDto, ip);
  }
}
