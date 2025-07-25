import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema, User } from './schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService ) => ({
        secret: configService.get<string>('JWT_SECRET')
      })
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy]
})
export class AuthModule {}
