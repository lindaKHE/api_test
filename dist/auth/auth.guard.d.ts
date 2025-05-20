import { CanActivate, ExecutionContext } from '@nestjs/common';
import { UserService } from 'src/service/user.service';
export declare class BasicAuthGuard implements CanActivate {
    private readonly userService;
    private readonly logger;
    constructor(userService: UserService);
    private getUserPasswordHash;
    getAllUsers(): Promise<import("../models/dto/user-response.dto").UserResponseDto[]>;
    canActivate(context: ExecutionContext): Promise<boolean>;
}
