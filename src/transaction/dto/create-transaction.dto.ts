import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateTransactionDto {
  @IsEnum(['income', 'expense'], {
    message: 'transaction_type is required [income or expense]',
  })
  transaction_type: 'income' | 'expense';

  @IsMongoId()
  wallet_id: string;

  @IsOptional()
  @IsString()
  expense_type?: string;

  @IsNotEmpty()
  @IsDateString()
  transaction_date: Date;

  @IsNumber()
  transaction_amount: number;

  @IsOptional()
  @IsUrl({}, { message: 'transaction_receipt must be a valid URL' })
  transaction_receipt?: string;
}
