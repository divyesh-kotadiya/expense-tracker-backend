import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Delete,
  Get,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionService.create(createTransactionDto);
  }

  @Patch(':id')
  async update(
    @Param('id') transactionId: string,
    @Body() updateDto: UpdateTransactionDto,
  ) {
    return this.transactionService.update(transactionId, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id') transactionId: string) {
    return this.transactionService.delete(transactionId);
  }

  @Get('wallet/:walletId')
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Param('walletId') walletId: string,
  ) {
    return this.transactionService.findByWallet(
      walletId,
      Number(page),
      Number(limit),
    );
  }
  @Get('overview')
  async getOverview(
    @Query('walletId') walletId: string,
    @Query('period') period: 'week' | 'month' | 'year',
  ) {
    return this.transactionService.getOverview(walletId, period);
  }
}
