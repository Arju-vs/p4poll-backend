import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.userModel.findById(payload.sub).select('-password')
    if (!user) {
    throw new UnauthorizedException('User not found');
  }
  return {
  userId: user._id.toString(), // ✅ Provide userId explicitly
  email: user.email,
  role: user.role,
  verifiedUser: user.verifiedUser,
  name: user.name
};
  }
}
