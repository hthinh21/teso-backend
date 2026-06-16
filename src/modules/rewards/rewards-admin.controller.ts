import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { RewardsService } from './rewards.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { Reward } from './entities/reward.entity';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ParseUUIDPipe } from '@nestjs/common';

@ApiTags('Admin Rewards Management')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/rewards')
export class RewardsAdminController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Post()
  @ApiOperation({
    summary: 'Tạo mới một món quà (Chỉ dành cho Admin)',
    description:
      'Thêm mới quà tặng hệ thống. Tự động xóa cache danh sách quà cũ trên Redis.',
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo mới quà tặng thành công.',
    type: Reward,
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu nhập vào bị thiếu hoặc lỗi định dạng.',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập hoặc token hết hạn.',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập (yêu cầu quyền Admin).',
  })
  async create(@Body() createRewardDto: CreateRewardDto): Promise<Reward> {
    return this.rewardsService.create(createRewardDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật thông tin món quà (Chỉ dành cho Admin)',
    description:
      'Chỉnh sửa thông tin quà tặng theo ID. Tự động xóa cache danh sách và cache chi tiết quà trên Redis.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật quà tặng thành công.',
    type: Reward,
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu đầu vào không hợp lệ.',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập hoặc token hết hạn.',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập (yêu cầu quyền Admin).',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy quà tặng với ID cần cập nhật.',
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateRewardDto: UpdateRewardDto,
  ): Promise<Reward> {
    return this.rewardsService.update(id, updateRewardDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Xóa một món quà khỏi hệ thống (Chỉ dành cho Admin)',
    description:
      'Xóa hoàn toàn quà tặng khỏi hệ thống. Tự động xóa cache danh sách và cache chi tiết quà trên Redis.',
  })
  @ApiResponse({
    status: 204,
    description: 'Xóa quà tặng thành công.',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập hoặc token hết hạn.',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập (yêu cầu quyền Admin).',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy quà tặng với ID cần xóa.',
  })
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.rewardsService.remove(id);
  }
}
