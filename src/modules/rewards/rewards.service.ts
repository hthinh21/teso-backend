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
  private readonly REWARDS_CACHE_TTL = 10 * 60 * 1000; // 10 minutes in milliseconds

  constructor(
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  // USER API: View all rewards (Cached in Redis)
  async findAll(): Promise<Reward[]> {
    // 1. Check if cached rewards exist in Redis
    const cachedRewards = await this.cacheManager.get<Reward[]>(
      this.REWARDS_LIST_CACHE_KEY,
    );
    if (cachedRewards) {
      return cachedRewards;
    }

    // 2. Query database if not in cache
    const rewards = await this.rewardRepository.find({
      order: { createdAt: 'DESC' },
    });

    // 3. Save to Redis
    await this.cacheManager.set(
      this.REWARDS_LIST_CACHE_KEY,
      rewards,
      this.REWARDS_CACHE_TTL,
    );

    return rewards;
  }

  // USER API: View specific reward (Cached in Redis)
  async findOne(id: string): Promise<Reward> {
    const cacheKey = `reward_detail:${id}`;

    // 1. Check cache
    const cachedReward = await this.cacheManager.get<Reward>(cacheKey);
    if (cachedReward) {
      return cachedReward;
    }

    // 2. Query DB
    const reward = await this.rewardRepository.findOne({ where: { id } });
    if (!reward) {
      throw new NotFoundException(`Không tìm thấy quà tặng với ID: ${id}`);
    }

    // 3. Save to cache
    await this.cacheManager.set(cacheKey, reward, this.REWARDS_CACHE_TTL);

    return reward;
  }

  // ADMIN API: Create a new reward (Invalidate list cache)
  async create(createRewardDto: CreateRewardDto): Promise<Reward> {
    const reward = this.rewardRepository.create(createRewardDto);
    const savedReward = await this.rewardRepository.save(reward);

    // Invalidate list cache
    await this.clearListCache();

    return savedReward;
  }

  // ADMIN API: Update a reward (Invalidate list & detail cache)
  async update(id: string, updateRewardDto: UpdateRewardDto): Promise<Reward> {
    const reward = await this.rewardRepository.preload({
      id,
      ...updateRewardDto,
    });

    if (!reward) {
      throw new NotFoundException(`Không tìm thấy quà tặng với ID: ${id}`);
    }

    const updatedReward = await this.rewardRepository.save(reward);

    // Invalidate caches
    await this.clearListCache();
    await this.clearDetailCache(id);

    return updatedReward;
  }

  // ADMIN API: Remove a reward (Invalidate list & detail cache)
  async remove(id: string): Promise<Reward> {
    const reward = await this.findOne(id); // Checks DB/Cache and throws NotFound
    await this.rewardRepository.remove(reward);

    // Invalidate caches
    await this.clearListCache();
    await this.clearDetailCache(id);

    return reward;
  }

  // Helper: Clear rewards list cache
  private async clearListCache(): Promise<void> {
    await this.cacheManager.del(this.REWARDS_LIST_CACHE_KEY);
  }

  // Helper: Clear specific reward detail cache
  private async clearDetailCache(id: string): Promise<void> {
    await this.cacheManager.del(`reward_detail:${id}`);
  }
}
