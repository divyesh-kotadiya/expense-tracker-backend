import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Wallet {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Auth' })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  wallet_name: string;

  @Prop({ required: false })
  wallet_image: string;

  @Prop({ default: 0 })
  amount: number;

  @Prop({ default: 0 })
  total_income: number;

  @Prop({ default: 0 })
  total_expense: number;
  id: any;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
