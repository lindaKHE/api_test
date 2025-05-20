// src/address/address.module.ts
import { Module } from '@nestjs/common';
import { AddressService } from 'src/service/address.service';
import { AddressController } from '../controllers/address.controller';
import { AuthModule } from './auth/auth.module'; 
import { ADDRCONFIG } from 'dns';
import { getgid } from 'process';
import { serializeJsonQuery } from '@prisma/client/runtime/library';
import { DefaultDeserializer } from 'v8';
import { hasOnlyExpressionInitializer } from 'typescript';
import { join } from 'path';

@Module({
  imports: [AuthModule],  
  controllers: [AddressController],
  providers: [AddressService],
})
export class AddressModule {}

