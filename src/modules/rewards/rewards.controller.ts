import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RewardsService } from './rewards.service';
import { Reward } from './entities/reward.entity';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@ApiTags('Rewards')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get()
  @ApiOperation({
    summary: 'Xem danh sách quà tặng hệ thống',
    description:
      'API trả về toàn bộ danh sách quà tặng. Dữ liệu được cache trên Redis trong 10 phút.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành công.',
    type: [Reward],
  })
  @ApiResponse({
    status: 401,
    description: 'Token xác thực không hợp lệ hoặc đã hết hạn.',
  })
  async findAll(): Promise<Reward[]> {
    return this.rewardsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Xem thông tin chi tiết của một món quà',
    description:
      'Trả về thông tin chi tiết của món quà theo ID. Dữ liệu được cache trên Redis.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin chi tiết thành công.',
    type: Reward,
  })
  @ApiResponse({
    status: 401,
    description: 'Token xác thực không hợp lệ hoặc đã hết hạn.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy quà tặng với ID được cung cấp.',
  })
  async findOne(@Param('id') id: string): Promise<Reward> {
    return this.rewardsService.findOne(id);
  }
}
