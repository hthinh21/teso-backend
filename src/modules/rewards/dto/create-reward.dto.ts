import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateRewardDto {
  @ApiProperty({
    example: 'iPhone 15 Pro Max',
    description: 'Tên của món quà',
  })
  @IsString()
  @IsNotEmpty({ message: 'Tên quà không được để trống' })
  name: string;

  @ApiProperty({
    example: 'Món quà công nghệ đỉnh cao từ Apple',
    description: 'Mô tả chi tiết về món quà',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 1000,
    description: 'Số điểm cần có để đổi món quà này',
  })
  @IsInt({ message: 'Điểm số phải là số nguyên' })
  @Min(0, { message: 'Điểm số phải lớn hơn hoặc bằng 0' })
  pointsCost: number;

  @ApiProperty({
    example: 50,
    description: 'Số lượng quà còn lại trong kho',
  })
  @IsInt({ message: 'Số lượng kho phải là số nguyên' })
  @Min(0, { message: 'Số lượng kho phải lớn hơn hoặc bằng 0' })
  stock: number;

  @ApiProperty({
    example: 'https://example.com/iphone15.jpg',
    description: 'Đường dẫn ảnh hiển thị của món quà',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
