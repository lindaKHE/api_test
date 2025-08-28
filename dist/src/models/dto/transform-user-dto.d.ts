export declare function transformUserDto(data: {
    name?: string;
    firstname?: string;
    gender?: string;
    birthdate?: string;
    username: string;
    password?: string;
    parentId?: string;
    role?: string;
}): {
    role: string;
    parentId: string;
    birthdate: Date;
    firstname: string;
    gender: string;
    name: string;
    password: string;
    username: string;
};
