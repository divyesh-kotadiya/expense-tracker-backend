import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateUserDto } from './dto/update-user.dto';
import { Auth } from 'src/auth/schemas/auth.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(Auth.name) private userModal: Model<Auth>) {}

  async updateProfile(userId: string, updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userModal
      .findByIdAndUpdate(userId, { $set: updateUserDto }, { new: true })
      .select('-password');
    if (!updatedUser) {
      return {
        success: false,
        message: 'User not found.',
      };
    }

    return {
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser,
    };
  }
}
