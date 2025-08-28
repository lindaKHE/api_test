import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/service/user.service';

@Injectable()
export class AdminBasicAuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    try {
      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      const [username, password] = credentials.split(':');

      const user = await this.userService.findByusername(username);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }


      if (user.isAdmin) return true;
      else throw new UnauthorizedException('User is not admin');
    } catch (error) {
      throw new UnauthorizedException('Invalid admin credentials');
    }
  }
}
