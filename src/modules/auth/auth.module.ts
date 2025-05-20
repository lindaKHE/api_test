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

@Module({
//  imports: [PrismaModule],
  providers: [AuthService, BasicAuthGuard, UserService],
  exports: [AuthService, BasicAuthGuard],
})
export class AuthModule {}