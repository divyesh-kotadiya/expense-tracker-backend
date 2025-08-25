import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { WalletModule } from './wallet/wallet.module';
import { TransactionModule } from './transaction/transaction.module';
import { PassportModule } from '@nestjs/passport';
@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/expense-tracker-app'),
    PassportModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    WalletModule,
    TransactionModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
