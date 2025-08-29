import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction } from './schemas/transaction.schema';
import { Wallet } from 'src/wallet/schema/wallet.schema';
import { Model, Types } from 'mongoose';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from 'date-fns';
@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(Wallet.name) private walletModel: Model<Wallet>,
  ) {}

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

    return {
      message: 'Transaction created successfully',
      data: transaction,
    };
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

    return {
      message: 'Transaction updated successfully',
      data: transaction,
    };
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

    return {
      message: 'Transaction deleted successfully',
      data: deletedTransaction,
    };
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

    return {
      message: 'Transactions fetched successfully',
      data: transactions,
      total: totalRecords,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
    };
  }
  async getOverview(walletId: string, period: 'week' | 'month' | 'year') {
    const now = new Date();
    let start: Date, end: Date;

    if (!period || !walletId) {
      throw new BadRequestException(
        !period
          ? 'period is required [week, month, year].'
          : 'wallet_id is required.',
      );
    }

    if (period === 'week') {
      start = startOfWeek(now, { weekStartsOn: 1 });
      end = endOfWeek(now, { weekStartsOn: 1 });
    } else if (period === 'month') {
      start = startOfMonth(now);
      end = endOfMonth(now);
    } else {
      start = startOfYear(now);
      end = endOfYear(now);
    }

    const stats = await this.transactionModel.aggregate([
      {
        $match: {
          wallet_id: new Types.ObjectId(walletId),
          transaction_date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id:
            period === 'week'
              ? { $dayOfWeek: '$transaction_date' }
              : period === 'month'
                ? { $dayOfMonth: '$transaction_date' }
                : { $month: '$transaction_date' },
          income: {
            $sum: {
              $cond: [
                { $eq: ['$transaction_type', 'income'] },
                '$transaction_amount',
                0,
              ],
            },
          },
          expense: {
            $sum: {
              $cond: [
                { $eq: ['$transaction_type', 'expense'] },
                '$transaction_amount',
                0,
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $addFields: {
          label:
            period === 'week'
              ? {
                  $arrayElemAt: [
                    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                    { $subtract: ['$_id', 1] },
                  ],
                }
              : period === 'month'
                ? { $concat: ['Date ', { $toString: '$_id' }] }
                : {
                    $arrayElemAt: [
                      [
                        'Jan',
                        'Feb',
                        'Mar',
                        'Apr',
                        'May',
                        'Jun',
                        'Jul',
                        'Aug',
                        'Sep',
                        'Oct',
                        'Nov',
                        'Dec',
                      ],
                      { $subtract: ['$_id', 1] },
                    ],
                  },
        },
      },
      { $project: { _id: 0, label: 1, income: 1, expense: 1 } },
    ]);

    return {
      message: `${period} overview fetched successfully`,
      data: stats,
    };
  }
}
