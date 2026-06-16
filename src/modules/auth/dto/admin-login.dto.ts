import { ApiProperty } from '@nestjs/swagger';
import { LoginDto } from './login.dto';

export class AdminLoginDto extends LoginDto {
  @ApiProperty({
    example: 'admin@example.com',
    description: 'Địa chỉ email đăng nhập của Admin',
  })
  declare email: string;

  @ApiProperty({
    example: 'adminpassword',
    description: 'Mật khẩu đăng nhập của Admin',
  })
  declare password: string;
}
