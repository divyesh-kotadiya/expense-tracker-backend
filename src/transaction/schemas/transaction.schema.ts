import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true, enum: ['income', 'expense'], default: 'expense' })
  transaction_type: 'income' | 'expense';

  @Prop({ type: Types.ObjectId, required: true, ref: 'Wallet' })
  wallet_id: Types.ObjectId;

  @Prop({ required: false })
  expense_type?: string;

  @Prop({ required: true })
  transaction_date: Date;

  @Prop({ required: true })
  transaction_amount: number;

  @Prop({ required: false })
  transaction_receipt?: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
