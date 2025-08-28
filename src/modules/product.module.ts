
import { Module } from '@nestjs/common';
import {  PrismaService } from './prisma'; 

import { ProductController } from 'src/controllers/product.controller';
import { ProductService } from 'src/service/product.service';


@Module({
    controllers: [ProductController],
    providers: [ProductService, PrismaService],
  })
  export class ProductModule {}
  