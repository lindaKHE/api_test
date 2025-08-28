import { UserResponseDto } from "src/models/dto/user-response.dto";

  export enum EGender {
    WOMAN = 'WOMAN',
    MAN = 'MAN'
  }

  export enum EUserSortColumn {
    FIRST_NAME = 'firstName',
    NAME = 'name',
  }
  
 
  
  export enum EOrderSort {
    ASC = 'asc',
    DESC = 'desc',
  }
  export interface IPaginatedUsers {
    data: UserResponseDto[];
    pageCount: number;
    resultCount: number;
  }
  
  export enum ERole {
    ADMIN = 'ADMIN',
    PARENT = 'PARENT',
    CHILD = 'CHILD'
  }