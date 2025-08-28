export function transformUserDtoWithoutPassword(dto: {
    username: string;
    name?: string;
    firstname?: string;
    gender?: string;
    birthdate?: string;
    role?: string;
  }) {
    return {
      ...dto,
    };
  }
  