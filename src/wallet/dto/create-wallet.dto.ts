import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateWalletDto {
  @IsString()
  @IsNotEmpty()
  wallet_name: string;

  @IsOptional()
  @IsUrl({}, { message: 'wallet_image must be a valid URL' })
  wallet_image?: string;
}
