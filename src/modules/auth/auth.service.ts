import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthCacheService } from './auth-cache.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User, UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly authCacheService: AuthCacheService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    return this.usersService.create(registerDto);
  }

  async loginUser(
    loginDto: LoginDto,
    ip: string,
  ): Promise<{ accessToken: string; user: Omit<User, 'password'> }> {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      await this.authCacheService.registerFailedAttempt(ip, email);
      throw new BadRequestException('Email hoặc mật khẩu không chính xác');
    }

    await this.authCacheService.resetAttempts(ip, email);

    const accessToken = this.generateToken(user);

    const userWithoutPassword = { ...user } as Partial<User>;
    delete userWithoutPassword.password;

    return {
      accessToken,
      user: userWithoutPassword as Omit<User, 'password'>,
    };
  }

  async loginAdmin(
    loginDto: LoginDto,
    ip: string,
  ): Promise<{ accessToken: string; user: Omit<User, 'password'> }> {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmail(email);

    if (
      !user ||
      !(await bcrypt.compare(password, user.password)) ||
      user.role !== UserRole.ADMIN
    ) {
      await this.authCacheService.registerFailedAttempt(ip, email);
      throw new BadRequestException('Email hoặc mật khẩu không chính xác');
    }
    await this.authCacheService.resetAttempts(ip, email);
    const accessToken = this.generateToken(user);
    const userWithoutPassword = { ...user } as Partial<User>;
    delete userWithoutPassword.password;
    return {
      accessToken,
      user: userWithoutPassword as Omit<User, 'password'>,
    };
  }

  private generateToken(user: User): string {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload);
  }
}
