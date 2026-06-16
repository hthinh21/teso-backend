import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthCacheService } from '../auth-cache.service';
import { Request } from 'express';

@Injectable()
export class LoginRateLimitGuard implements CanActivate {
  constructor(private readonly authCacheService: AuthCacheService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const rawIp =
      request.headers['x-forwarded-for'] || request.socket.remoteAddress || '';
    const ip = Array.isArray(rawIp) ? rawIp[0] : rawIp;

    const body = request.body as Record<string, unknown> | undefined;
    const email = body?.email as string | undefined;

    if (!email) {
      return true;
    }

    const isBlocked = await this.authCacheService.isBlocked(ip, email);
    if (isBlocked) {
      throw new HttpException(
        'Tài khoản này đã bị khóa tạm thời do nhập sai mật khẩu nhiều lần. Vui lòng thử lại sau.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
