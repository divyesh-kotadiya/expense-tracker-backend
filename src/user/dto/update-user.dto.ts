import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;
  @IsOptional()
  @IsUrl({}, { message: 'avatartUrl must be a valid URL' })
  avatarUrl?: string;
}
