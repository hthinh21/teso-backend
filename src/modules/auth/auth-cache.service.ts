import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthCacheService {
  private readonly maxAttempts: number;
  private readonly blockDurationMs: number;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {
    this.maxAttempts = parseInt(
      this.configService.get<string>('RATE_LIMIT_MAX_ATTEMPTS', '5'),
      10,
    );
    const durationSeconds = parseInt(
      this.configService.get<string>('RATE_LIMIT_BLOCK_DURATION', '900'),
      10,
    );
    this.blockDurationMs = durationSeconds * 1000;
  }

  private getAttemptsKey(ip: string, email: string): string {
    return `login_attempts:${ip}:${email}`;
  }

  private getBlockKey(ip: string, email: string): string {
    return `login_block:${ip}:${email}`;
  }

  async isBlocked(ip: string, email: string): Promise<boolean> {
    const blocked = await this.cacheManager.get<boolean>(
      this.getBlockKey(ip, email),
    );
    return !!blocked;
  }

  async registerFailedAttempt(
    ip: string,
    email: string,
  ): Promise<{ attempts: number; max: number; isBlocked: boolean }> {
    const attemptsKey = this.getAttemptsKey(ip, email);
    const currentAttempts =
      (await this.cacheManager.get<number>(attemptsKey)) || 0;
    const newAttempts = currentAttempts + 1;

    if (newAttempts >= this.maxAttempts) {
      await this.cacheManager.set(
        this.getBlockKey(ip, email),
        true,
        this.blockDurationMs,
      );
      await this.cacheManager.del(attemptsKey);
      return { attempts: newAttempts, max: this.maxAttempts, isBlocked: true };
    }

    await this.cacheManager.set(attemptsKey, newAttempts, this.blockDurationMs);
    return { attempts: newAttempts, max: this.maxAttempts, isBlocked: false };
  }

  async resetAttempts(ip: string, email: string): Promise<void> {
    await this.cacheManager.del(this.getAttemptsKey(ip, email));
    await this.cacheManager.del(this.getBlockKey(ip, email));
  }
}
