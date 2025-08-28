import { UserResponseDto } from "src/models/dto/user-response.dto";
export declare enum EGender {
    WOMAN = "WOMAN",
    MAN = "MAN"
}
export declare enum EUserSortColumn {
    FIRST_NAME = "firstName",
    NAME = "name"
}
export declare enum EOrderSort {
    ASC = "asc",
    DESC = "desc"
}
export interface IPaginatedUsers {
    data: UserResponseDto[];
    pageCount: number;
    resultCount: number;
}
export declare enum ERole {
    ADMIN = "ADMIN",
    PARENT = "PARENT",
    CHILD = "CHILD"
}
