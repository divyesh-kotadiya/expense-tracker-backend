import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: false })
  username?: string;

  @Prop({ required: false })
  avatarUrl?: string;
}

export const userSchema = SchemaFactory.createForClass(User);
