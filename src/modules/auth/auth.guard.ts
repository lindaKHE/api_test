import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/service/user.service';
@Injectable()
export class BasicAuthGuard implements CanActivate {
  private readonly logger = new Logger(BasicAuthGuard.name);

  
  constructor(private readonly userService :  UserService) {}


  private async getUserPasswordHash(username: string): Promise<string | null> {
    return   await this.userService.findByUserPassword(username); 
  }


  async getAllUsers() {
    const users = await this.userService.getAllUsers({});


      return users;
  
    }
  


  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: any = context.switchToHttp().getRequest();
    
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      this.logger.warn('Header Authorization manquant ou incorrect');
      throw new UnauthorizedException('Authentification Basic requise');
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    let [username, password] = credentials.split(':');

    const storedPasswordHash = await this.getUserPasswordHash(username);
    
    if (!storedPasswordHash) {
      this.logger.warn('Utilisateur introuvable');
      throw new UnauthorizedException('Identifiantss incorrects');
    }

  


   const isPasswordValid = await bcrypt.compare(password, storedPasswordHash);
if (isPasswordValid) {
  const user = await this.userService.findByusername(username);

  //on le stocke ici le useer
  request.user = user; 
  return true; 
}

   

    this.logger.warn('Identifiants incorrects');
    throw new UnauthorizedException('Identifiants incorrects');
  }
}
