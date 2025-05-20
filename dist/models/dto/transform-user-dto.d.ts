export declare function transformUserDto(data: {
    name?: string;
    firstname?: string;
    gender?: string;
    birthdate?: string;
    username: string;
    password: string;
}): {
    birthdate: Date;
    firstname: string;
    gender: string;
    name: string;
    password: string;
    username: string;
};
