import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from './prisma'; 
import { AddressService } from '../service/address.service';
import { AddressController } from '../controllers/address.controller';
import { AuthModule } from './auth/auth.module';
import { UserService } from '../service/user.service';
import { UserController } from '../controllers/user.controller';
import { ProductController } from 'src/controllers/product.controller';
import { ProductService } from 'src/service/product.service';
import { OrderModule } from './order.module';


@Module({
  providers: [AddressService, UserService,ProductService, PrismaService],
  controllers: [AddressController,UserController,ProductController],
  imports: [ OrderModule,PrismaModule, AuthModule],
})
export class AppModule {}
