import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config'
import { PollsModule } from './polls/polls.module';
 

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true}),
    MongooseModule.forRoot(process.env.MONGO_URI as string),
    AuthModule,
    PollsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
