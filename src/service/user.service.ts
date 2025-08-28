import { Injectable } from '@nestjs/common';
import { PrismaService } from '../modules/prisma/prisma.service';
import { CreateUserDto } from 'src/models/dto/create-user.dto';
import { UpdateUserDto } from 'src/models/dto/update-user.dto';
import { FilterUserQuery } from 'src/models/dto/filter-user.query';
import { UserResponseDto } from 'src/models/dto/user-response.dto';
import { Address, User } from '@prisma/client';
import { transformUserDto } from 'src/models/dto/transform-user-dto';
import * as bcrypt from 'bcrypt';
import { AddressResponseDto } from 'src/models/dto/address-response.dto';
import { EOrderSort, EUserSortColumn, IPaginatedUsers } from 'src/interfaces/user.interface';
import { CreateChildDto } from 'src/models/dto/create-child.dto';
import { transformUserDtoWithoutPassword } from 'src/models/dto/transform-user-dto-withoutPassword';


@Injectable()

export class UserService {
  constructor(private prisma: PrismaService) { }

  public transformToUserResponseDto(user: User & { addresses?: Address[]; profiles?: { code: string; label: string }[] }): UserResponseDto {

    const today = new Date();
    const age = user.birthdate ? today.getFullYear() - user.birthdate.getFullYear() : null;


    function getImProfile(age: number | null): { code: string; label: string } | null {
      if (age === null) return null;
      if (age < 10) return { code: 'enfant', label: 'Enfant' };
      if (age < 25) return { code: 'jeune', label: 'Jeune' };
      if (age < 50) return { code: 'tout_public', label: 'Tout public' };
      return { code: 'senior', label: 'Senior' };
    }

    const implicitProfile = getImProfile(age);

    return {
      id: user.id,
      name: user.name,
      firstname: user.firstname,
      username: user.username,
      parentId: user.parentId,

      birthdate: user.birthdate ? user.birthdate.toLocaleDateString('fr-FR') : null,
      gender: user.gender || null,
      createdAt: user.createdAt ? user.createdAt.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) : null,

      addresses: user.addresses && user.addresses.length > 0
        ? user.addresses.map(address => this.transformToAddressResponseDto(address))
        : [],
      profiles: {
        explicites: user.profiles?.map(p => ({ code: p.code, label: p.label })) || [],
        implicite: implicitProfile,
      }
    };

  }
  public transformToAddressResponseDto(address: Address & { user?: { name: string } }): AddressResponseDto {
    return {
      id: address.id,
      street: address.street,
      city: address.city,
      postalCode: address.postalCode,
      country: address.country,
      userName: address.user?.name || '',
      userId: address.userId,

    };
  }



  async isChildOfParent(parentId: string, childId: string): Promise<boolean> {
    const child = await this.prisma.user.findFirst({
      where: {
        id: childId,
        parentId: parentId,
      },
    });
    return !!child;
  }



  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto | string> {
    const { profileCodes } = createUserDto;
    const userData = transformUserDto(createUserDto);

    if (userData.parentId) {
      const parent = await this.prisma.user.findUnique({ where: { id: userData.parentId } });
      if (!parent) return 'PARENT_NOT_FOUND';
      userData.password = parent.password;
    } else {
      if (!userData.password) return 'PASSWORD_REQUIRED';
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    let profiles = [];
    if (profileCodes?.length) {
      profiles = await this.prisma.profile.findMany({ where: { code: { in: profileCodes } } });
      if (profiles.length !== profileCodes.length) return 'INVALID_PROFILES';
    }

    const user = await this.prisma.user.create({
      data: {
        ...userData,
        ...(profiles.length > 0 && {
          profiles: {
            connect: profiles.map((p) => ({ id: p.id })),
          },
        }),
      },
    
      include: { addresses: true, profiles: true },
    });

    return this.transformToUserResponseDto(user);
  }




  async createChild(parentId: string, createUserDto: CreateChildDto): Promise<UserResponseDto | string> {
    const parent = await this.prisma.user.findUnique({ where: { id: parentId } });
    if (!parent) return 'PARENT_NOT_FOUND';

    const existingUser = await this.prisma.user.findUnique({
      where: { username: createUserDto.username },
    });
    if (existingUser) return 'USERNAME_CONFLICT';

    const { profileCodes } = createUserDto;
    const childData = transformUserDtoWithoutPassword(createUserDto);

    delete (childData as any).parentId;

    if (childData.birthdate) {
      (childData as any).birthdate = new Date(childData.birthdate);
    }

    let profiles = [];
    if (profileCodes?.length) {
      profiles = await this.prisma.profile.findMany({
        where: { code: { in: profileCodes } }
      });
      if (profiles.length !== profileCodes.length) {
        return 'INVALID_PROFILES';
      }
    }

    const createdChild = await this.prisma.user.create({
      data: {
        ...childData,
        parentId: parent.id,
        profiles: {
          connect: profiles.map(p => ({ id: p.id }))
        }
      },
      include: { profiles: true, addresses: true },
    });

    return this.transformToUserResponseDto(createdChild);
  }


  async getMyChildren(
    parentId: string,
    page: number,
    limit: number,
    sortBy: EUserSortColumn = EUserSortColumn.NAME,
    sortOrder: EOrderSort = EOrderSort.ASC,
  ): Promise<{ data: UserResponseDto[]; pageCount: number; resultCount: number }> {
    const skip = (page - 1) * limit;

    const [resultCount, children] = await this.prisma.$transaction([
      this.prisma.user.count({
        where: { parentId },
      }),
      this.prisma.user.findMany({
        where: { parentId },
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder.toLowerCase(), // conversion ASC/desc en string
        },
        include: {
          profiles: true,
          addresses: true,
        },
      }),
    ]);

    const pageCount = Math.ceil(resultCount / limit);

    return {
      data: children.map(child => this.transformToUserResponseDto(child)),
      pageCount,
      resultCount,
    };
  }






  async deleteChild(parentId: string, childId: string): Promise<UserResponseDto> {
    const child = await this.prisma.user.findUnique({
      where: { id: childId },
      include: { profiles: true, addresses: true },
    });

    if (!child || child.parentId !== parentId) {
      return null;
    }

    await this.prisma.user.update({
      where: { id: childId },
      data: {
        profiles: { set: [] },
      },
    });

    await this.prisma.address.deleteMany({
      where: { userId: childId },
    });

    const deletedChild = await this.prisma.user.delete({
      where: { id: childId },
    });

    return this.transformToUserResponseDto(deletedChild);
  }

  async deleteUser(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { addresses: true, profiles: true },
    });

    if (!user) {
      return null;
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        profiles: { set: [] },
      },
    });

    await this.prisma.address.deleteMany({
      where: { userId: id },
    });

    const deletedUser = await this.prisma.user.delete({
      where: { id },
    });

    return this.transformToUserResponseDto(deletedUser);
  }


  async removeProfilesFromUser(userId: string, profileCodes: string[]): Promise<User | 'NOT_FOUND' | 'NOT_LINKED'> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profiles: true },
    });

    if (!user) return 'NOT_FOUND';

    //je recois les id de profils 
    const profilesToRemove = await this.prisma.profile.findMany({
      where: {
        code: { in: profileCodes }
      },
      select: { id: true },
    });
    // je recupere tt les profils déja liés  a ce user 
    const profileIdsToRemove = profilesToRemove.map(p => p.id);
    const userWithProfiles = await this.prisma.user.findUnique({
      where: { id: userId },

      include: { profiles: true },
    });

    const linkedProfileIds = userWithProfiles?.profiles.map(p => p.id) || [];


    // les profils a supprimer linked to this profil 
    const validProfileIds = profileIdsToRemove.filter(id => linkedProfileIds.includes(id));

    if (validProfileIds.length === 0) {
      return 'NOT_LINKED';
    }

    // le disconnect entre user et profiles 
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        profiles: {
          disconnect: profilesToRemove.map(p => ({ id: p.id })),
        },
      },
    });

    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { profiles: true },
    });
  }



  async findByUserPassword(username: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { password: true }, // récupérer uniquement le champ password
    });

    if (!user) return null;

    return user.password; // renvoyer juste le hash de mot de passe
  }


  async findByusername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        addresses: true,
        profiles: true,
        children: true,
      },
    });

    if (!user) return null;

    return user;
  }


  async getUserById(id: string): Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { addresses: true, profiles: true },
    });

    return user ? this.transformToUserResponseDto(user) : null;
  }



  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const { profileCodes, ...rest } = updateUserDto;
    const dataToUpdate: any = { ...rest };

    if (updateUserDto.birthdate) {
      dataToUpdate.birthdate = new Date(updateUserDto.birthdate + 'T00:00:00');
    }

    if (profileCodes?.length) {
      const profiles = await this.prisma.profile.findMany({
        where: { code: { in: profileCodes } },
      });

      if (profiles.length !== profileCodes.length) {
        return null;
      }

      dataToUpdate.profiles = {
        connect: profiles.map(p => ({ id: p.id })),
      };
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      include: {
        profiles: true,
        addresses: true,
      },
    });

    return this.transformToUserResponseDto(updatedUser);
  }



  async getAllUsers(filter: FilterUserQuery): Promise<UserResponseDto[]> {

    const { name, profileCode } = filter;
    const condition: any = {};

    if (name) {
      condition.name = { contains: name };
    }

    if (profileCode) {
      condition.profiles = {
        some: { code: profileCode }
      };

    }

    const users = await this.prisma.user.findMany({

      where: condition,

      include: { addresses: true, profiles: true },
    });

    return users.map(user => this.transformToUserResponseDto(user));
  }
  //ajouter filtre sur nom et sur le profile 

  async getPaginatedUsers(
    page: number,
    limit: number,
    sortBy: EUserSortColumn = EUserSortColumn.NAME,
    sortOrder: EOrderSort = EOrderSort.ASC,
  ): Promise<IPaginatedUsers> {
    const validSortColumns = Object.values(EUserSortColumn);

    if (!validSortColumns.includes(sortBy)) {
      sortBy = EUserSortColumn.NAME;
    }
    if (![EOrderSort.ASC, EOrderSort.DESC].includes(sortOrder)) {
      sortOrder = EOrderSort.ASC;
    }

    const skip = (page - 1) * limit;

    const users = await this.prisma.user.findMany({
      skip: skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,

      },

      include: { profiles: true, addresses: true },
    });

    const resultCount = await this.prisma.user.count();

    const pageCount = Math.ceil(resultCount / limit);

    if (!users) return {
      data: [],
      pageCount: 0,
      resultCount: 0
    }

    return {
      data: users.map(user => this.transformToUserResponseDto(user)),
      pageCount,
      resultCount,
    };
  }



} 