import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction } from './schemas/transaction.schema';
import { Wallet } from 'src/wallet/schema/wallet.schema';
import { Model, Types } from 'mongoose';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(Wallet.name) private walletModel: Model<Wallet>,
  ) {}

  private formatResponse(
    success: boolean,
    message: string,
    data: object = {},
    totals: object = {},
  ) {
    return { success, message, data, ...totals };
  }

  async create(createTransactionDto: CreateTransactionDto) {
    const { wallet_id, transaction_type, transaction_amount } =
      createTransactionDto;

    const wallet = await this.walletModel.findById(wallet_id).exec();
    if (!wallet) throw new NotFoundException('Wallet not found.');

    if (transaction_type === 'expense' && transaction_amount > wallet.amount) {
      throw new NotFoundException(
        'Wallet does not have enough balance for this expense.',
      );
    }

    const transaction = new this.transactionModel({
      ...createTransactionDto,
      wallet_id: new Types.ObjectId(wallet_id),
    });
    await transaction.save();

    if (transaction_type === 'income') {
      wallet.amount += transaction_amount;
      wallet.total_income += transaction_amount;
    } else {
      wallet.amount -= transaction_amount;
      wallet.total_expense += transaction_amount;
    }
    await wallet.save();

    return this.formatResponse(true, 'Transaction created successfully', {
      transaction,
    });
  }

  async update(transactionId: string, updateDto: UpdateTransactionDto) {
    const transaction = await this.transactionModel.findById(transactionId);
    if (!transaction) throw new NotFoundException('Transaction not found.');

    const wallet = await this.walletModel
      .findById(transaction.wallet_id)
      .exec();
    if (!wallet) throw new NotFoundException('Wallet not found.');

    if (transaction.transaction_type === 'income') {
      wallet.amount -= transaction.transaction_amount;
      wallet.total_income -= transaction.transaction_amount;
    } else {
      wallet.amount += transaction.transaction_amount;
      wallet.total_expense -= transaction.transaction_amount;
    }

    const { transaction_type, transaction_amount, wallet_id } = updateDto;
    transaction.set({
      ...updateDto,
      wallet_id: new Types.ObjectId(wallet_id || transaction.wallet_id),
    });
    await transaction.save();

    if (transaction_type === 'income') {
      wallet.amount += transaction_amount;
      wallet.total_income += transaction_amount;
    } else {
      if (transaction_amount > wallet.amount) {
        throw new NotFoundException(
          'Wallet does not have enough balance for this expense.',
        );
      }
      wallet.amount -= transaction_amount;
      wallet.total_expense += transaction_amount;
    }
    await wallet.save();

    return this.formatResponse(true, 'Transaction updated successfully', {
      transaction,
    });
  }

  async delete(transactionId: string) {
    const transaction = await this.transactionModel.findById(transactionId);
    if (!transaction) throw new NotFoundException('Transaction not found.');

    const wallet = await this.walletModel
      .findById(new Types.ObjectId(transaction.wallet_id))
      .exec();

    if (!wallet) throw new NotFoundException('Wallet not found.');

    if (transaction.transaction_type === 'income') {
      wallet.amount -= transaction.transaction_amount;
      wallet.total_income -= transaction.transaction_amount;
    } else {
      wallet.amount += transaction.transaction_amount;
      wallet.total_expense -= transaction.transaction_amount;
    }
    await wallet.save();

    const deletedTransaction =
      await this.transactionModel.findByIdAndDelete(transactionId);

    return this.formatResponse(
      true,
      'Transaction deleted successfully',
      deletedTransaction as object,
    );
  }

  async findByWallet(walletId: string, page = 1, limit = 10) {
    const wallet = await this.walletModel.findById(walletId).exec();
    if (!wallet) throw new NotFoundException('Wallet not found.');

    const skip = (page - 1) * limit;
    const [transactions, totalRecords] = await Promise.all([
      this.transactionModel
        .find({ wallet_id: new Types.ObjectId(walletId) })
        .skip(skip)
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('-__v')
        .exec(),
      this.transactionModel.countDocuments({
        wallet_id: new Types.ObjectId(walletId),
      }),
    ]);

    return this.formatResponse(
      true,
      'Transactions fetched successfully',
      transactions,
      { totalRecords, page, totalPages: Math.ceil(totalRecords / limit) },
    );
  }
}
