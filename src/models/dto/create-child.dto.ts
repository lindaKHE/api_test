import { IsString, IsDateString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class CreateChildDto {
  @IsString()
  username: string;

  @IsString()
  name: string;

  @IsString()
  firstname: string;

  @ApiProperty({ example: '2000-01-01' })
  @IsOptional()
  @IsDateString()
  birthdate?: string;
  

  @IsString()
  gender: string;
  
  @ApiProperty({ example: ['CHILD'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  profileCodes?: string[];

}
