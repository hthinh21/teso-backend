import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Reward } from './entities/reward.entity';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';

@Injectable()
export class RewardsService {
  private readonly REWARDS_LIST_CACHE_KEY = 'system_rewards_list';
  private readonly REWARDS_CACHE_TTL = 10 * 60 * 1000;

  constructor(
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async findAll(): Promise<Reward[]> {
    const cachedRewards = await this.cacheManager.get<Reward[]>(
      this.REWARDS_LIST_CACHE_KEY,
    );
    if (cachedRewards) {
      return cachedRewards;
    }

    const rewards = await this.rewardRepository.find({
      order: { createdAt: 'DESC' },
    });

    await this.cacheManager.set(
      this.REWARDS_LIST_CACHE_KEY,
      rewards,
      this.REWARDS_CACHE_TTL,
    );

    return rewards;
  }

  async findOne(id: string): Promise<Reward> {
    const cacheKey = `reward_detail:${id}`;

    const cachedReward = await this.cacheManager.get<Reward>(cacheKey);
    if (cachedReward) {
      return cachedReward;
    }

    const reward = await this.rewardRepository.findOne({ where: { id } });
    if (!reward) {
      throw new NotFoundException(`Không tìm thấy quà tặng với ID: ${id}`);
    }

    await this.cacheManager.set(cacheKey, reward, this.REWARDS_CACHE_TTL);

    return reward;
  }

  async create(createRewardDto: CreateRewardDto): Promise<Reward> {
    const reward = this.rewardRepository.create(createRewardDto);
    const savedReward = await this.rewardRepository.save(reward);

    await this.clearListCache();

    return savedReward;
  }

  async update(id: string, updateRewardDto: UpdateRewardDto): Promise<Reward> {
    const reward = await this.rewardRepository.preload({
      id,
      ...updateRewardDto,
    });

    if (!reward) {
      throw new NotFoundException(`Không tìm thấy quà tặng với ID: ${id}`);
    }

    const updatedReward = await this.rewardRepository.save(reward);

    await this.clearListCache();
    await this.clearDetailCache(id);

    return updatedReward;
  }

  async remove(id: string): Promise<Reward> {
    const reward = await this.findOne(id);
    await this.rewardRepository.remove(reward);

    await this.clearListCache();
    await this.clearDetailCache(id);

    return reward;
  }

  private async clearListCache(): Promise<void> {
    await this.cacheManager.del(this.REWARDS_LIST_CACHE_KEY);
  }

  private async clearDetailCache(id: string): Promise<void> {
    await this.cacheManager.del(`reward_detail:${id}`);
  }
}
