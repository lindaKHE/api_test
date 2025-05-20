import { Injectable } from '@nestjs/common';
import { PrismaService } from '../modules/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDto } from 'src/models/dto/create-user.dto';
import { UpdateUserDto } from 'src/models/dto/update-user.dto';
import { FilterUserQuery } from 'src/models/dto/filter-user.query';
import { UserResponseDto } from 'src/models/dto/user-response.dto';
import { Address, User } from '@prisma/client';
import { transformUserDto } from 'src/models/dto/transform-user-dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus } from '@nestjs/common';
import { EGender } from 'src/interfaces/user.interface';
//import {  } from '@prisma/client';




@Injectable()


export class UserService {
  constructor(private prisma: PrismaService) { }

  private transformToUserResponseDto(user: User & { addresses?: Address[]}): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      firstname: user.firstname,
      birthdate: user.birthdate,
      EGender: user.gender || null ,
      createdAt: user.createdAt.toLocaleDateString('fr-FR'),
      addresses: user.addresses?.map(address => ({
        street: address.street,
        city: address.city,
        postalCode: address.postalCode,
        country: address.country,
      })),
  
    };
  }



  //creation 


  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {


    const userData = transformUserDto(createUserDto);



    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    } else {

      delete userData.password;
    }

    try {
      const user = await this.prisma.user.create({
        data: userData,

      });


      return this.transformToUserResponseDto(user);
    } catch (error) {
      if (
        error.code === 'P2002' &&
        error.meta?.target?.includes('user_username_key')
      ) {
        throw new HttpException(
          "Le nom d'utilisateur est déjà utilisé.",
          HttpStatus.CONFLICT,
        );
      }



       // autre erreur 
      console.error('Erreur lors de la création de l\'utilisateur :', error);
      throw new HttpException(
        'Échec de la création utilisateur',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
  }
}






  /*async deleteUser(id: string): Promise<UserResponseDto> {
    const deletedUser = await this.prisma.user.delete({
      where: { id },
    });
    return this.transformToUserResponseDto(deletedUser);
   
  }*/


  async deleteUser(id: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });

      if (!user) {
        throw new NotFoundException(`Utilisateur avec l'id ${id} non trouvé.`);
      }


      const deletedUser = await this.prisma.user.delete({ where: { id } });

      return deletedUser; // ou retour d'une réponse formatée si nécessaire


      //return await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new NotFoundException(`Requête invalide : ${error.message}`);
      }

      throw error;
    }
  }


  
  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }
  
  


  async getUserById(id: string): Promise< User & { addresses?: Address[] } > {
    return this.prisma.user.findUnique({
      where: { id },
      include: { addresses: true }, 
    });
  }
  
  /*async getUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });

    
  }*/

  /*async updateUser(id: string, updateUserDto: UpdateUserDto) :Promise<UserResponseDto>  {
    
    const transformedData = transformUserDto(updateUserDto); // même fonction
  const updatedUser = await this.prisma.user.update({
    where: { id },
    data: transformedData,
  });

    return this.transformToUserResponseDto(updatedUser);

  }*/
  //ekher wahda 
  /*async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const { password } = updateUserDto;
    
    // Si le mot de passe est fourni, le hacher avant la mise à jour
    if (password) {
      updateUserDto.password = await bcrypt.hash(password, 10);
    }
  
    const transformedData = transformUserDto(updateUserDto); 
  
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: transformedData,
    });
  
    return this.transformToUserResponseDto(updatedUser);
  }
  */
  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
    return this.transformToUserResponseDto(updatedUser);
  }


  async getAllUsers(filter: FilterUserQuery): Promise<UserResponseDto[]> {
    const { nom } = filter;

    //const Condition = nom ? { name: nom } : {};

    const Condition = nom ? { name: { contains: nom, mode: 'insensitive' } } : {};


    const users = await this.prisma.user.findMany({

      where: Condition,
      include: { addresses: true },
      
   }
  );
    console.log(users); 

    return users.map(this.transformToUserResponseDto);

  }

 
  
    



 

}
