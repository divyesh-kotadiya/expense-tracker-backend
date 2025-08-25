/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  create(@Request() req: any, @Body() createWalletDto: CreateWalletDto) {
    const userId = req?.user?.id as string;
    return this.walletService.create(userId, createWalletDto);
  }

  @Get()
  findAll(
    @Request() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const userId = req?.user?.id as string;
    return this.walletService.findByUser(userId, Number(page), Number(limit));
  }

  @Patch(':id')
  update(
    @Param('id') walletId: string,
    @Body() updateWalletDto: UpdateWalletDto,
  ) {
    return this.walletService.update(walletId, updateWalletDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.walletService.delete(id);
  }
}
