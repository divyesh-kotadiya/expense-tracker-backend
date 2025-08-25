import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth } from 'src/auth/schemas/auth.schema';
import { userSchema } from './schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Auth.name, schema: userSchema }]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
