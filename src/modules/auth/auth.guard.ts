/*import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // 1. Vérification du header Authorization
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new UnauthorizedException('Authentification Basic requise');
    }

    // 2. Extraction des credentials
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');

    // 3. Validation (version simplifiée - à adapter)
    if (username === 'linda' && password === 'linda') {
      return true; // Authentification réussie
    }

    // 4. Gestion des échecs
    throw new UnauthorizedException('Identifiants incorrects');
  }
}*/

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/service/user.service';
@Injectable()
export class BasicAuthGuard implements CanActivate {
  private readonly logger = new Logger(BasicAuthGuard.name);

  
  constructor(private readonly userService :  UserService) {}


  private async getUserPasswordHash(username: string): Promise<string | null> {
    const user = await this.userService.findByUsername(username); 
    return user?.password || null;
  }


  async getAllUsers() {
    const users = await this.userService.getAllUsers({});

      //console.log(users); 

      return users;
  
    }
  


  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      this.logger.warn('Header Authorization manquant ou incorrect');
      throw new UnauthorizedException('Authentification Basic requise');
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');

    const storedPasswordHash = await this.getUserPasswordHash(username);
    if (!storedPasswordHash) {
      this.logger.warn('Utilisateur introuvable');
      throw new UnauthorizedException('Identifiantss incorrects');
    }


    if (password === storedPasswordHash) {
      this.logger.log('Mot de passe égal au hash, bcrypt inutile');
      return true;
    }
    
   // console.log('Mot de passe reçu :', password);
   // console.log('Mot de passe attendu hashéé :', storedPasswordHash);
    
    const isPasswordValid = await bcrypt.compare(password, storedPasswordHash);
    if (isPasswordValid) {
      return true; // Authentification réussie
    }
   
    console.log(password )
    console.log(storedPasswordHash)

    this.logger.warn('Identifiants incorrects');
    throw new UnauthorizedException('Identifiants incorrects');
  }
}
