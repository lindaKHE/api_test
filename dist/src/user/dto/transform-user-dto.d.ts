export declare function transformUserDto(data: {
    name?: string;
    firstname?: string;
    birthdate?: string;
    username: string;
    password: string;
}): {
    birthdate: Date;
    firstname: string;
    name: string;
    password: string;
    username: string;
};
