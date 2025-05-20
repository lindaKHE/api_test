/*import { Controller, Get , Post , Body , Param , Delete ,UseGuards} from '@nestjs/common';
import { UserService } from 'src/service/user.service';
import { Patch } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { Query } from '@nestjs/common';
import { FilterUserQuery } from 'src/user/dto/filter-user.query';
import { UserResponseDto } from 'src/user/dto/user-response.dto';
import { NotFoundException } from '@nestjs/common';

import { BasicAuthGuard } from 'src/auth/auth.guard'; 




//@UseGuards(BasicAuthGuard)  

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

 /* @Get('profile')  
 @UseGuards(BasicAuthGuard)  
  getProfile() {
    return { message: 'Profile data, protected by BasicAuthGuard' };
  }
  
	

  /*@UseGuards(BasicAuthGuard)
@Get('some-protected-route')
getSomething() {
  return { message: 'This route is protected by BasicAuthGuard' };
}*/



  /*@Get()
  //@UseGuards(BasicAuthGuard)
  getAllUsers(@Query() filter: FilterUserQuery): Promise<UserResponseDto[]> {
    return this.userService.getAllUsers(filter);
    
  }
  
  
            

  @Get(':id')
  async getById(@Param('id') id: string) {
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'id ${id} non trouvé.`);
    }
    return this.userService['transformToUserResponseDto'](user);
  }
  

@Post()
createUser(@Body() createUserDto: CreateUserDto) {
  return this.userService.createUser(createUserDto);
}




@Patch(':id')
async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {  
  
  const user = await this.userService.getUserById(id);
  if (!user) {
    throw new NotFoundException(`Utilisateur avec l'id ${id} non trouvé.`);
  }

  return this.userService.updateUser(id, updateUserDto);

}



@Delete(':id')
async deleteUser(@Param('id') id: string) {
  const user = await this.userService.getUserById(id);
  if (!user) {
    throw new NotFoundException(`Utilisateur avec l'id ${id} non trouvé.`);
  }

  return this.userService.deleteUser(id);
}



  
}
*/

import { Controller, Get, Post, Body, Param, Delete, Patch, Query, UseGuards } from '@nestjs/common';
import { UserService } from 'src/service/user.service';
import { CreateUserDto } from 'src/models/dto/create-user.dto';
import { UpdateUserDto } from 'src/models/dto/update-user.dto';
import { FilterUserQuery } from 'src/models/dto/filter-user.query';
import { UserResponseDto } from 'src/models/dto/user-response.dto';
import { NotFoundException } from '@nestjs/common';

import { BasicAuthGuard } from 'src/modules/auth/auth.guard';
 

// exception pour cree l'adress avec user qui n'existe pas !


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}


  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    console.log('aa');

    return this.userService.createUser(createUserDto);
  }

  @Get()
  @UseGuards(BasicAuthGuard)
  getAllUsers(@Query() filter: FilterUserQuery): Promise<UserResponseDto[]> {
    return this.userService.getAllUsers(filter);
  }

  @Get(':id')
  @UseGuards(BasicAuthGuard)
  async getById(@Param('id') id: string) {
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'id ${id} non trouvé.`);
    }
    return this.userService.getUserById(id);; 
  }

  @Patch(':id')
  @UseGuards(BasicAuthGuard)
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {  
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'id ${id} non trouvé.`);
    }
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  async deleteUser(@Param('id') id: string) {
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'id ${id} non trouvé.`);
    }
    return this.userService.deleteUser(id);
  }
}