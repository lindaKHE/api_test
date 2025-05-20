import { Controller, Post, Body, Patch, Param, Delete, Get , UseGuards} from '@nestjs/common';
import { AddressService } from '../service/address.service';
import { CreateAddressDto } from '../models/dto/create-address.dto';
import { UpdateAddressDto } from '../models/dto/update-address.dto';
import { BasicAuthGuard } from 'src/modules/auth/auth.guard';
import { get } from 'lodash';

//import { AuthGuard } from '@nestjs/passport';
@UseGuards(BasicAuthGuard)
@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
//   @UseGuards(AuthGuard)
  create(@Body() createAddressDto: CreateAddressDto) {
    return this.addressService.create(createAddressDto);
  }

@Patch('user/:userId')
  update(@Param('id') id: string, @Body() updateAddressDto: UpdateAddressDto) {
    return this.addressService.update(id, updateAddressDto);
  }

  

  //@UseGuards(BasicAuthGuard)
//@Get('some-protected-route')
//getSomething() {
 // return { message: 'This route is protected by BasicAuthGuard' };
//}


  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.addressService.remove(id);
  }

  
@Get()
getAll() {
  return this.addressService.getAll(); 
}



/*@Get('address')
@UseGuards(BasicAuthGuard)

getAddress() {
  return this.addressService.getAll();
}*/





  @Get('user/:userId')
  @UseGuards(BasicAuthGuard) 
  findByUser(@Param('userId') userId: string) {
    return this.addressService.getAllByUser(userId);
  }
}
