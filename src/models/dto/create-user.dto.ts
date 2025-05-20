import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EGender } from 'src/interfaces/user.interface';
import { Transform } from 'class-transformer';


export class CreateUserDto {


  @IsOptional()
  @IsEnum( EGender, { message: 'Le genre doit être "WOMAN" ou "MAN"' })
  @Transform(({ value }) => value?.toUpperCase())

  @ApiProperty({ enum: EGender, example: EGender.WOMAN })
  gender?: EGender; 

  @ApiProperty()
  @IsString()
  username : string;

  @ApiProperty()
  @IsString()
  password: string;




  @ApiProperty({ example: 'khelifa' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'linda' })
  @IsOptional()
  @IsString()
  firstname?: string;

  @ApiProperty({ example: '2000-01-01' })
  @IsOptional()
  @IsDateString()
  birthdate?: string;

  @ApiProperty({ example: '10 rue des Lilas' })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiProperty({ example: 'Paris' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: '75000' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({ example: 'France' })
  @IsOptional()
  @IsString()
  country?: string;
}
