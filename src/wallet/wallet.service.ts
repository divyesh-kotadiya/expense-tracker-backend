import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Wallet } from './schema/wallet.schema';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { Model, Types } from 'mongoose';

@Injectable()
export class WalletService {
  constructor(@InjectModel(Wallet.name) private walletModel: Model<Wallet>) {}

  private formatResponse(
    success: boolean,
    message: string,
    data: object = {},
    meta: object = {},
  ) {
    return { success, message, data, ...meta };
  }

  async create(userId: string, walletDto: CreateWalletDto) {
    const wallet = new this.walletModel({
      ...walletDto,
      user_id: new Types.ObjectId(userId),
    });

    const savedWallet = await wallet.save();

    return this.formatResponse(
      true,
      'Wallet created successfully.',
      savedWallet,
    );
  }

  async findByUser(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const userObjectId = new Types.ObjectId(userId);

    const [wallets, total] = await Promise.all([
      this.walletModel
        .find({ user_id: userObjectId })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .select('-__v')
        .exec(),
      this.walletModel.countDocuments({ user_id: userObjectId }),
    ]);

    if (!wallets.length) {
      return this.formatResponse(true, 'No wallets found.', []);
    }
    return this.formatResponse(true, 'Wallets fetched successfully', wallets, {
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  }

  async update(walletId: string, updateWalletDto: UpdateWalletDto) {
    const updatedWallet = await this.walletModel.findByIdAndUpdate(
      walletId,
      { ...updateWalletDto },
      { new: true },
    );

    if (!updatedWallet) {
      throw new NotFoundException(`Wallet with id ${walletId} not found`);
    }

    return this.formatResponse(
      true,
      'Wallet updated successfully',
      updatedWallet,
    );
  }

  async delete(walletId: string) {
    const deletedWallet = await this.walletModel.findByIdAndDelete(walletId);

    if (!deletedWallet) {
      throw new NotFoundException(`Wallet with id ${walletId} not found`);
    }

    return this.formatResponse(
      true,
      'Wallet deleted successfully',
      deletedWallet,
    );
  }
}
