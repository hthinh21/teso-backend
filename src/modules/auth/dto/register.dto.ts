import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Địa chỉ email đăng ký tài khoản',
  })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Mật khẩu đăng nhập, tối thiểu 6 ký tự',
  })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải chứa ít nhất 6 ký tự' })
  password: string;

  @ApiProperty({
    example: 'Thinh Do',
    description: 'Họ và tên của người dùng',
    required: false,
  })
  @IsOptional()
  @IsString()
  fullName?: string;
}
