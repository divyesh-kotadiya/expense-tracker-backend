import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Auth {
  @Prop({ required: true })
  username: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false })
  avatarUrl: string;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
