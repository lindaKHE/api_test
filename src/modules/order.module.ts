import { Module } from '@nestjs/common';
import { OrderController } from 'src/controllers/order.controller';
import { OrderService } from 'src/service/order.service';
import { UserService } from 'src/service/user.service';

@Module({

  controllers: [OrderController],
  providers: [OrderService,UserService],
})
export class OrderModule {}
