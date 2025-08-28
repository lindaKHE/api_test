
export function transformUserDto(data: {
  name?: string;
  firstname?: string;
  gender?: string;
  birthdate?: string;
  username: string;
  password?: string;
  parentId?: string;    

  role?: string; 
}) {
  return {
    ...(data.username && { username: data.username }),
    ...(data.password && { password: data.password }),
    ...(data.name !== undefined && { name: data.name }),
    ...(data.gender !== undefined && { gender: data.gender }),

    ...(data.firstname !== undefined && { firstname: data.firstname }),
    ...(data.birthdate !== undefined && { birthdate: new Date(data.birthdate) }),
    ...(data.parentId !== undefined && { parentId: data.parentId }),
    ...(data.role !== undefined && { role: data.role }),
  };
}
