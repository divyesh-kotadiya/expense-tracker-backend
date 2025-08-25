import {
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';

export class UpdateTransactionDto {
  @IsOptional()
  @IsEnum(['income', 'expense'])
  transaction_type: 'income' | 'expense';

  @IsMongoId()
  @IsOptional()
  wallet_id: string;

  @IsOptional()
  @IsString()
  expense_type?: string;

  @IsOptional()
  @IsDateString()
  transaction_date?: Date;

  @IsNumber()
  @IsOptional()
  transaction_amount: number;

  @IsOptional()
  @IsString()
  transaction_receipt?: string;
}
