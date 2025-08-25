import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Delete,
  Get,
  UseGuards,
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
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionService.update(transactionId, updateTransactionDto);
  }

  @Delete(':id')
  async delete(@Param('id') transactionId: string) {
    return this.transactionService.delete(transactionId);
  }

  @Get('wallet/:walletId')
  async findByWallet(@Param('walletId') walletId: string) {
    return this.transactionService.findByWallet(walletId);
  }
}
