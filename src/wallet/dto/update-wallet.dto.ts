import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateWalletDto {
  @IsOptional()
  @IsString()
  wallet_name?: string;

  @IsOptional()
  @IsUrl({}, { message: 'wallet_image must be a valid URL' })
  wallet_image?: string;
}
