import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PrismaModule } from './modules/prisma'; 
import { AddressService } from './service/address.service';
import { AddressController } from './controllers/address.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UserService } from './service/user.service';


@Module({
  providers: [AddressService, UserService],
  controllers: [AddressController],
  imports: [PrismaModule, UserModule, AuthModule],
})
export class AppModule {}
