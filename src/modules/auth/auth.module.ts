/*import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BasicAuthGuard } from './auth.guard';  
import { PrismaModule } from 'prisma/prisma.module';


@Module({
imports: [PrismaModule],

providers: [AuthService, BasicAuthGuard],
exports: [AuthService, BasicAuthGuard],  
})
export class AuthModule {}
*/
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BasicAuthGuard } from './auth.guard';
import { UserService } from 'src/service/user.service';
import { AdminBasicAuthGuard } from './admin-basic-auth.guard';

@Module({
//  imports: [PrismaModule],
  providers: [AuthService, BasicAuthGuard, AdminBasicAuthGuard, UserService],
  exports: [AuthService, BasicAuthGuard],
})
export class AuthModule {}
