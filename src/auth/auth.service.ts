import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Auth } from './schemas/auth.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name) private authModal: Model<Auth>,
    private jwtService: JwtService,
  ) {}

  private getAccessToken(user: Auth & { _id: any }) {
    const payload = {
      id: user._id as string,
      username: user.username,
      email: user.email,
    };
    return this.jwtService.sign(payload);
  }

  async register(username: string, email: string, password: string) {
    const existingUser = await this.authModal.findOne({ email }).exec();
    if (existingUser) {
      throw new BadRequestException(
        `User with this email ${email} already exists.`,
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new this.authModal({
      username,
      email,
      password: hashedPassword,
    });
    const savedUser = await newUser.save();

    const token = this.getAccessToken(savedUser);

    return {
      message: 'User registered successfully.',
      data: {
        _id: savedUser.id as string,
        username: savedUser.username,
        email: savedUser.email,
        access_token: token,
      },
    };
  }

  async login(email: string, password: string) {
    const existingUser = await this.authModal.findOne({ email }).exec();
    if (!existingUser) {
      throw new BadRequestException(
        `User with this email ${email} not exists.`,
      );
    }

    const comparePassword = await bcrypt.compare(
      password,
      existingUser.password,
    );
    if (!comparePassword) {
      throw new BadRequestException(`Invalid credentials.`);
    }

    const token = this.getAccessToken(existingUser);

    return {
      message: 'Login successfully.',
      data: {
        _id: existingUser.id as string,
        username: existingUser.username,
        email: existingUser.email,
        access_token: token,
      },
    };
  }
}
