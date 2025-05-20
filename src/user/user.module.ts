import { Module } from '@nestjs/common';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../service/user.service';
import { AuthModule } from 'src/modules/auth/auth.module';


@Module({
  imports: [AuthModule],

  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
