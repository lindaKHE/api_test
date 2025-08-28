import { Controller, Get, Post, Body, Param, Delete, Patch, Query, UseGuards, Res, NotFoundException, ConflictException, InternalServerErrorException, ForbiddenException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserService } from 'src/service/user.service';
import { CreateUserDto } from 'src/models/dto/create-user.dto';
import { UpdateUserDto } from 'src/models/dto/update-user.dto';
import { UserResponseDto } from 'src/models/dto/user-response.dto';
import { BasicAuthGuard } from 'src/modules/auth/auth.guard';
import { EUserSortColumn, EOrderSort } from 'src/interfaces/user.interface';
import { Response } from 'express';
import { AddressService } from 'src/service/address.service';
import { AdminBasicAuthGuard } from 'src/modules/auth/admin-basic-auth.guard';
import { User } from '@prisma/client';
import { CurrentUser } from 'src/decorators/currentUser.decorator';
import { CreateChildDto } from 'src/models/dto/create-child.dto';
import { ApiBasicAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@ApiTags('Utilisateur')
@ApiBasicAuth('basic-auth')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService, private addressService: AddressService) { }

  @Post()
  @UseGuards(BasicAuthGuard, AdminBasicAuthGuard)
  @ApiOperation({ summary: 'Créer un utilisateur' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201, description: 'Utilisateur créé', type: UserResponseDto, example: {
      "id": "d0b5844b-3886-4911-8947-0b5020c64cf5",
      "name": "enfant de ahmed",
      "firstname": " skhiri",
      "username": " es sk",
      "parentId": "a1aae375-0a9f-46e9-9401-4522bdeaecb1",
      "birthdate": "09/05/2002",
      "gender": "man",
      "createdAt": "16/07/2025 02:16:54",
      "addresses": ["..."],
      "profiles": {
        "code": "jeune",

      }
    }
  })
  @ApiResponse({ status: 409, description: "Nom d'utilisateur déjà utilisé" })
  @ApiResponse({ status: 500, description: 'Erreur lors de la création de l’utilisateur' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const result = await this.userService.createUser(createUserDto);

      if (result === 'PARENT_NOT_FOUND') {
        throw new NotFoundException("Parent introuvable.");
      }
      if (result === 'PASSWORD_REQUIRED') {
        throw new BadRequestException('Le mot de passe est requis pour les utilisateurs sans parent.');
      }
      if (result === 'INVALID_PROFILES') {
        throw new NotFoundException('Un ou plusieurs profils sont invalides.');
      }
      if (!result || typeof result !== 'object') {
        throw new BadRequestException('Un ou plusieurs profils sont invalides ou données manquantes.');
      }

      return result;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002' &&
        (error.meta?.target as string)?.includes('user_username_key')
      ) {
        throw new ConflictException("Le nom d'utilisateur est déjà utilisé.");
      }
      throw new InternalServerErrorException('Erreur lors de la création de l’utilisateur.');
    }
  }




  @UseGuards(BasicAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Récupérer ses propres informations' })
  @ApiResponse({ status: 200, description: 'Utilisateur connecté', type: UserResponseDto })
  @ApiResponse({ status: 403, description: 'Accès interdit' })
  async getMe(@CurrentUser() currentUser: User) {
    if (!currentUser) {
      throw new ForbiddenException("Accès interdit à ce profil.");
    }
    return this.userService.transformToUserResponseDto(currentUser);

  }



  @UseGuards(AdminBasicAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Lister les utilisateurs avec pagination et tri' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', enum: EUserSortColumn })
  @ApiQuery({ name: 'sortOrder', enum: EOrderSort })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs' })
  async getUsers(
    @Res() res: Response,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('sortBy') sortBy: EUserSortColumn = EUserSortColumn.NAME,
    @Query('sortOrder') sortOrder: EOrderSort = EOrderSort.ASC,
  ): Promise<void> {
    let pageNumber = parseInt(page, 10);
    let limitNumber = parseInt(limit, 10);

    if (isNaN(pageNumber) || pageNumber < 1) pageNumber = 1;
    if (isNaN(limitNumber) || limitNumber < 1) limitNumber = 10;

    const { data, pageCount, resultCount } = await this.userService.getPaginatedUsers(
      pageNumber,
      limitNumber,
      sortBy,
      sortOrder,
    );

    res.setHeader('number-of-page', pageNumber.toString());
    res.setHeader('page-count', pageCount.toString());
    res.setHeader('columns', 'name,createdAt');
    res.setHeader('result-count', resultCount.toString());
    res.status(200).json({
      data,
      page: pageNumber,
      pageCount,
      resultCount,
    });
  }

  @UseGuards(BasicAuthGuard)
  @Get('/children')
  @ApiOperation({ summary: 'Récupérer les enfants du parent connecté avec pagination' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', enum: EUserSortColumn, required: false })
  @ApiQuery({ name: 'sortOrder', enum: EOrderSort, required: false })
  @ApiResponse({
    status: 200,
    description: 'Liste paginée des enfants',
  })
  @ApiResponse({ status: 404, description: 'Aucun enfant trouvé' })
  async getChildren(
    @Res() res: Response,
    @CurrentUser() user: User,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('sortBy') sortBy: EUserSortColumn = EUserSortColumn.NAME,
    @Query('sortOrder') sortOrder: EOrderSort = EOrderSort.ASC,
  ): Promise<void> {
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.max(parseInt(limit, 10) || 10, 1);

    const { data, pageCount, resultCount } = await this.userService.getMyChildren(
      user.id,
      pageNumber,
      limitNumber,
      sortBy,
      sortOrder,
    );

    if (!data || data.length === 0) {
      throw new NotFoundException(`Aucun enfant trouvé pour le parent avec l'id ${user.id}`);
    }

    res.setHeader('number-of-page', pageNumber.toString());
    res.setHeader('page-count', pageCount.toString());
    res.setHeader('result-count', resultCount.toString());

    res.status(200).json({
      data,
      page: pageNumber,
      pageCount,
      resultCount,
    });
  }





  @UseGuards(BasicAuthGuard)
  @ApiOperation({ summary: 'Récupérer toutes les adresses par utilisateur' })
  @ApiParam({ name: 'userId' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  async getAllByUser(@Param('userId') userId: string, @CurrentUser() currentUser: User) {
    const isAllowed = userId === currentUser.id || await this.userService.isChildOfParent(currentUser.id, userId);
    if (!isAllowed) throw new ForbiddenException("Accès refusé.");
    return this.addressService.getAllByUser(userId);
  }


  @UseGuards(BasicAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un utilisateur par ID (soi-même, enfant, ou admin)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 403, description: 'Accès interdit' })
  async getById(@Param('id') id: string, @CurrentUser() currentUser: any): Promise<UserResponseDto> {
    if (!currentUser.isAdmin) {
      // Vérifier que c'est soi-même ou son enfant
      const isSelf = id === currentUser.id;
      const isChild = await this.userService.isChildOfParent(currentUser.id, id);
      if (!isSelf && !isChild) {
        throw new ForbiddenException("Accès interdit à ce profil.");
      }
    }

    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'id ${id} non trouvé.`);
    }
    return user;
  }




  @UseGuards(BasicAuthGuard)
  @Post('children')
  @ApiOperation({ summary: 'Créer un enfant pour le parent connecté' })
  @ApiBody({ type: CreateChildDto })
  @ApiResponse({ status: 403, description: 'Seuls les parents peuvent créer un enfant' })
  async createChild(@CurrentUser() user: User, @Body() dto: CreateChildDto): Promise<UserResponseDto> {
    const result = await this.userService.createChild(user.id, dto);

    if (result === 'PARENT_NOT_FOUND') {
      throw new NotFoundException("Parent introuvable.");
    }
    if (result === 'USERNAME_CONFLICT') {
      throw new ConflictException("Le nom d'utilisateur est déjà utilisé.");
    }
    if (result === 'INVALID_PROFILES') {
      throw new NotFoundException('Un ou plusieurs profils sont invalides.');
    }
    if (!result || typeof result !== 'object') {
      throw new ForbiddenException("Seuls les parents peuvent créer des comptes enfants");
    }

    return result;
  }


  @Patch(':id')
  @UseGuards(BasicAuthGuard)
  @ApiOperation({ summary: 'Mettre à jour un utilisateur (admin ou parent)' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: any,
  ): Promise<UserResponseDto> {
    const existingUser = await this.userService.getUserById(id);
    if (!existingUser) throw new NotFoundException('Utilisateur avec l id ${id} non trouvé.');
    if (!existingUser.parentId && !currentUser.isAdmin) {
      throw new UnauthorizedException("Vous n'avez pas le droit de modifier ce parent.");
    }
    if (existingUser.parentId && existingUser.parentId !== currentUser.id) {
      throw new UnauthorizedException("Vous ne pouvez modifier que vos enfants.");
    }
    const updatedUser = await this.userService.updateUser(id, updateUserDto);
    if (!updatedUser) throw new BadRequestException("Les données fournies sont invalides.");
    return updatedUser;
  }


  @UseGuards(BasicAuthGuard)
  @Delete('children/:childId')
  @ApiOperation({ summary: 'Supprimer un enfant' })
  @ApiParam({ name: 'childId' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async deleteChild(@CurrentUser() user: User, @Param('childId') childId: string): Promise<UserResponseDto> {
    const deletedChild = await this.userService.deleteChild(user.id, childId);
    if (!deletedChild) throw new NotFoundException('Enfant avec lid ${childId} non trouvé pour le parent ${user.id}.');
    return deletedChild;
  }



  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async deleteUser(@Param('id') id: string): Promise<UserResponseDto> {
    const deletedUser = await this.userService.deleteUser(id);
    if (!deletedUser) throw new NotFoundException('Utilisateur avec l id ${id} non trouvé.');
    return deletedUser;
  }


  @Patch(':id/remove-profiles')
  @UseGuards(BasicAuthGuard)
  @ApiOperation({ summary: 'Supprimer des profils d’un utilisateur' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { example: { profileCodes: ['PARENT', 'CHILD'] } } })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async removeProfilesFromUser(
    @Param('id') id: string,
    @Body() body: { profileCodes: string[] },
  ): Promise<UserResponseDto> {
    const result = await this.userService.removeProfilesFromUser(id, body.profileCodes);

    if (result === 'NOT_FOUND') {
      throw new NotFoundException(`Utilisateur avec l'id ${id} non trouvé.`);
    }

    if (result === 'NOT_LINKED') {
      throw new BadRequestException('Aucun des profils à retirer n’est associé à cet utilisateur.');
    }

    return this.userService.transformToUserResponseDto(result);
  }
}
